# Generated migration for performance indexes

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gym', '0007_fix_debt_default'),
    ]

    operations = [
        # Add indexes for frequently queried fields
        migrations.AddIndex(
            model_name='athlete',
            index=models.Index(fields=['full_name'], name='gym_athlete_full_name_idx'),
        ),
        migrations.AddIndex(
            model_name='athlete',
            index=models.Index(fields=['father_name'], name='gym_athlete_father_name_idx'),
        ),
        migrations.AddIndex(
            model_name='athlete',
            index=models.Index(fields=['contact_number'], name='gym_athlete_contact_idx'),
        ),
        migrations.AddIndex(
            model_name='athlete',
            index=models.Index(fields=['is_active'], name='gym_athlete_is_active_idx'),
        ),
        migrations.AddIndex(
            model_name='athlete',
            index=models.Index(fields=['gym_type'], name='gym_athlete_gym_type_idx'),
        ),
        migrations.AddIndex(
            model_name='athlete',
            index=models.Index(fields=['gym_time'], name='gym_athlete_gym_time_idx'),
        ),
        migrations.AddIndex(
            model_name='athlete',
            index=models.Index(fields=['fee_deadline_date'], name='gym_athlete_fee_deadline_idx'),
        ),
        migrations.AddIndex(
            model_name='athlete',
            index=models.Index(fields=['registration_date'], name='gym_athlete_reg_date_idx'),
        ),
        # Composite indexes for common filter combinations
        migrations.AddIndex(
            model_name='athlete',
            index=models.Index(fields=['is_active', 'gym_type'], name='gym_athlete_active_type_idx'),
        ),
        migrations.AddIndex(
            model_name='athlete',
            index=models.Index(fields=['is_active', 'fee_deadline_date'], name='gym_athlete_active_deadline_idx'),
        ),
        # Payment indexes
        migrations.AddIndex(
            model_name='payment',
            index=models.Index(fields=['athlete'], name='gym_payment_athlete_idx'),
        ),
        migrations.AddIndex(
            model_name='payment',
            index=models.Index(fields=['payment_date'], name='gym_payment_date_idx'),
        ),
        # Shelf indexes
        migrations.AddIndex(
            model_name='shelf',
            index=models.Index(fields=['status'], name='gym_shelf_status_idx'),
        ),
    ]
