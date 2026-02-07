from rest_framework import serializers
from .models import Athlete, Shelf, Payment
from datetime import date, timedelta
import logging

logger = logging.getLogger(__name__)

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'

class AthleteSerializer(serializers.ModelSerializer):
    days_left = serializers.ReadOnlyField()
    fee_deadline_date = serializers.DateField(required=False)
    final_fee = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)

    class Meta:
        model = Athlete
        fields = '__all__'

    def create(self, validated_data):
        # Calculate final fee
        gym_type = validated_data.get('gym_type')
        discount = validated_data.get('discount', 0)
        if gym_type == 'fitness':
            base_fee = 1000
        else:
            base_fee = 700
        final_fee = base_fee - discount
        
        # Set auto-calculated fields
        validated_data['final_fee'] = final_fee
        
        # Use provided fee_deadline_date or auto-calculate
        if 'fee_deadline_date' not in validated_data:
            validated_data['fee_deadline_date'] = date.today() + timedelta(days=30)
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        # Recalculate final fee if gym_type or discount changed
        gym_type = validated_data.get('gym_type', instance.gym_type)
        discount = validated_data.get('discount', instance.discount)
        
        if gym_type == 'fitness':
            base_fee = 1000
        else:
            base_fee = 700
        final_fee = base_fee - discount
        
        validated_data['final_fee'] = final_fee
        
        # Keep existing fee_deadline_date unless it's a renewal (handled separately)
        if 'fee_deadline_date' not in validated_data:
            validated_data['fee_deadline_date'] = instance.fee_deadline_date
        
        # ---------- ROBUST FIX: Only update is_active if explicitly provided ----------
        # Check if is_active was in the original request data (not just validated_data)
        if 'is_active' in self.initial_data:
            # It was explicitly provided, use the validated value
            logger.info(f"is_active explicitly provided: {validated_data.get('is_active')}")
        else:
            # Not in request, explicitly preserve current value
            logger.info(f"is_active not in request, preserving: {instance.is_active}")
            validated_data['is_active'] = instance.is_active
        
        return super().update(instance, validated_data)

class ShelfSerializer(serializers.ModelSerializer):
    athlete_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Shelf
        fields = '__all__'
    
    def get_athlete_name(self, obj):
        """Get the name of the assigned athlete"""
        if obj.assigned_athlete:
            return obj.assigned_athlete.full_name
        return None
    
    def validate(self, data):
        """Validate locker fields when assigning a locker"""
        # Only validate if we're assigning a locker to an athlete
        if self.instance and self.instance.assigned_athlete:
            return data
        return data
    
    def create(self, validated_data):
        """Create shelf with locker fields"""
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        """Update shelf with locker fields"""
        return super().update(instance, validated_data)