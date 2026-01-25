from django_filters import rest_framework as filters
from datetime import date, timedelta
from .models import Athlete


class AthleteFilter(filters.FilterSet):
    """Custom filter for Athlete model with fee status filtering"""
    
    gym_type = filters.ChoiceFilter(choices=Athlete.GYM_TYPE_CHOICES)
    gym_time = filters.ChoiceFilter(choices=Athlete.GYM_TIME_CHOICES)
    fee_status = filters.CharFilter(method='filter_fee_status')
    
    class Meta:
        model = Athlete
        fields = ['gym_type', 'gym_time', 'fee_status']
    
    def filter_fee_status(self, queryset, name, value):
        """
        Filter athletes by fee status:
        - 'safe': 16+ days remaining
        - 'warning': 6-15 days remaining
        - 'critical': 1-5 days remaining
        - 'overdue': 0 or negative days remaining
        """
        today = date.today()
        
        if value == 'safe':
            # 16+ days remaining
            target_date = today + timedelta(days=16)
            return queryset.filter(fee_deadline_date__gte=target_date)
        elif value == 'warning':
            # 6-15 days remaining
            start_date = today + timedelta(days=6)
            end_date = today + timedelta(days=15)
            return queryset.filter(fee_deadline_date__gte=start_date, fee_deadline_date__lte=end_date)
        elif value == 'critical':
            # 1-5 days remaining
            start_date = today + timedelta(days=1)
            end_date = today + timedelta(days=5)
            return queryset.filter(fee_deadline_date__gte=start_date, fee_deadline_date__lte=end_date)
        elif value == 'overdue':
            # 0 or negative days (overdue)
            return queryset.filter(fee_deadline_date__lt=today)
        
        return queryset
