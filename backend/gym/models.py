from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import pre_delete
from django.dispatch import receiver

class Athlete(models.Model):
    GYM_TYPE_CHOICES = [
        ('fitness', 'Fitness'),
        ('bodybuilding', 'Bodybuilding'),
    ]
    GYM_TIME_CHOICES = [
        ('morning', 'Morning'),
        ('afternoon', 'Afternoon'),
        ('night', 'Night'),
    ]

    full_name = models.CharField(max_length=100)
    father_name = models.CharField(max_length=100, blank=True)
    photo = models.ImageField(upload_to='athletes/', blank=True, null=True)
    registration_date = models.DateField(auto_now_add=True)
    fee_start_date = models.DateField(auto_now_add=True)
    fee_deadline_date = models.DateField()
    gym_type = models.CharField(max_length=20, choices=GYM_TYPE_CHOICES)
    gym_time = models.CharField(max_length=20, choices=GYM_TIME_CHOICES)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    final_fee = models.DecimalField(max_digits=10, decimal_places=2)
    contact_number = models.CharField(max_length=15, blank=True)
    notes = models.TextField(blank=True)
    shelf = models.OneToOneField('Shelf', on_delete=models.SET_NULL, null=True, blank=True)
    is_active = models.BooleanField(default=True)

    @property
    def days_left(self):
        from datetime import date
        return (self.fee_deadline_date - date.today()).days
    
    def save(self, *args, **kwargs):
        # Get the old instance if updating
        if self.pk:
            try:
                old_instance = Athlete.objects.get(pk=self.pk)
                old_shelf = old_instance.shelf
            except Athlete.DoesNotExist:
                old_shelf = None
        else:
            old_shelf = None
        
        # Save the athlete first
        super().save(*args, **kwargs)
        
        # Update old shelf status if it was changed
        if old_shelf and old_shelf != self.shelf:
            old_shelf.status = 'available'
            old_shelf.assigned_athlete = None
            old_shelf.save()
        
        # Update new shelf status
        if self.shelf:
            self.shelf.status = 'assigned'
            self.shelf.assigned_athlete = self
            self.shelf.save()

    def __str__(self):
        return self.full_name

class Payment(models.Model):
    PAYMENT_TYPES = [
        ('registration', 'Registration'),
        ('renewal', 'Renewal'),
    ]
    
    athlete = models.ForeignKey(Athlete, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateField(auto_now_add=True)
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPES)
    notes = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.athlete.full_name} - {self.amount}"

class Shelf(models.Model):
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('assigned', 'Assigned'),
    ]

    shelf_number = models.CharField(max_length=10, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    assigned_athlete = models.OneToOneField(Athlete, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_shelf')

    def __str__(self):
        return f"Shelf {self.shelf_number}"

@receiver(pre_delete, sender=Athlete)
def unassign_shelf_on_delete(sender, instance, **kwargs):
    if instance.shelf:
        instance.shelf.status = 'available'
        instance.shelf.assigned_athlete = None
        instance.shelf.save()
