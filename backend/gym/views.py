from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth
from datetime import date, timedelta

from .models import Athlete, Shelf, Payment
from .serializers import AthleteSerializer, ShelfSerializer, PaymentSerializer
from .filters import AthleteFilter


class AthleteViewSet(viewsets.ModelViewSet):
    queryset = Athlete.objects.all()
    serializer_class = AthleteSerializer
    filterset_class = AthleteFilter
    search_fields = ['full_name', 'father_name', 'contact_number']
    ordering_fields = ['registration_date', 'fee_deadline_date', 'full_name', 'is_active']
    ordering = ['-registration_date']
    
    def perform_create(self, serializer):
        athlete = serializer.save()
        # Create initial registration payment
        Payment.objects.create(
            athlete=athlete,
            amount=athlete.final_fee,
            payment_type='registration',
            notes='Initial registration fee'
        )
    
    @action(detail=True, methods=['post'])
    def renew(self, request, pk=None):
        """Renew athlete membership - reset fee dates"""
        athlete = self.get_object()
        duration_days = int(request.data.get('duration', 30))
        
        # Calculate amount based on duration? 
        # For now, just use final_fee * (duration/30) roughly? Or just final_fee.
        # Assuming final_fee is monthly.
        months = max(1, round(duration_days / 30))
        amount = athlete.final_fee * months
        
        athlete.fee_start_date = date.today()
        athlete.fee_deadline_date = date.today() + timedelta(days=duration_days)
        athlete.save()
        
        # Create Renewal Payment
        Payment.objects.create(
            athlete=athlete,
            amount=amount,
            payment_type='renewal',
            notes=f'Renewed for {duration_days} days'
        )
        
        serializer = self.get_serializer(athlete)
        return Response({
            'message': 'Membership renewed successfully',
            'athlete': serializer.data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def toggle_status(self, request, pk=None):
        """Toggle active/inactive status"""
        athlete = self.get_object()
        athlete.is_active = not athlete.is_active
        athlete.save()
        serializer = self.get_serializer(athlete)
        return Response(serializer.data)

class ShelfViewSet(viewsets.ModelViewSet):

    queryset = Shelf.objects.all()

    serializer_class = ShelfSerializer

class DashboardStatsView(APIView):
    def get(self, request):
        today = date.today()
        
        # 1. Basic Stats
        total_athletes = Athlete.objects.count()
        active_count = Athlete.objects.filter(is_active=True).count()
        inactive_count = total_athletes - active_count
        
        # Income (Total from Payments)
        total_income = Payment.objects.aggregate(Sum('amount'))['amount__sum'] or 0
        
        # Shelves
        total_shelves = Shelf.objects.count()
        available_shelves = Shelf.objects.filter(status='available').count()
        
        # 2. Revenue Trend (Last 6 Months)
        six_months_ago = today - timedelta(days=180)
        revenue_trend = Payment.objects.filter(payment_date__gte=six_months_ago)\
            .annotate(month=TruncMonth('payment_date'))\
            .values('month')\
            .annotate(total=Sum('amount'))\
            .order_by('month')
            
        trend_data = []
        for entry in revenue_trend:
            trend_data.append({
                'name': entry['month'].strftime('%b'),
                'amount': float(entry['total'])
            })
            
        # 3. Distributions
        gym_type_dist = [
            {'name': 'Fitness', 'value': Athlete.objects.filter(gym_type='fitness', is_active=True).count()},
            {'name': 'Bodybuilding', 'value': Athlete.objects.filter(gym_type='bodybuilding', is_active=True).count()}
        ]
        
        gym_time_dist = [
            {'name': 'Morning', 'value': Athlete.objects.filter(gym_time='morning', is_active=True).count()},
            {'name': 'Afternoon', 'value': Athlete.objects.filter(gym_time='afternoon', is_active=True).count()},
            {'name': 'Night', 'value': Athlete.objects.filter(gym_time='night', is_active=True).count()},
        ]
        
        status_dist = [
            {'name': 'Active', 'value': active_count},
            {'name': 'Inactive', 'value': inactive_count}
        ]
        
        # 4. Critical Alerts (Expiring or Overdue)
        critical_athletes = Athlete.objects.filter(
            fee_deadline_date__lte=today + timedelta(days=3),
            is_active=True
        )
        critical_data = sorted(AthleteSerializer(critical_athletes, many=True).data, key=lambda x: x['days_left'])
        
        return Response({
            'stats': {
                'total': total_athletes,
                'active': active_count,
                'inactive': inactive_count,
                'income': total_income,
                'shelves_total': total_shelves,
                'shelves_available': available_shelves,
            },
            'trends': {
                'revenue': trend_data,
            },
            'distributions': {
                'type': gym_type_dist,
                'time': gym_time_dist,
                'status': status_dist
            },
            'alerts': critical_data
        })
