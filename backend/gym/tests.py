from datetime import date, timedelta
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from .models import Athlete, Shelf, Payment


class AuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_superuser('admin', 'admin@test.com', 'admin123')

    def test_obtain_token(self):
        response = self.client.post('/api/token/', {'username': 'admin', 'password': 'admin123'})
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_obtain_token_invalid(self):
        response = self.client.post('/api/token/', {'username': 'admin', 'password': 'wrong'})
        self.assertEqual(response.status_code, 401)

    def test_refresh_token(self):
        res = self.client.post('/api/token/', {'username': 'admin', 'password': 'admin123'})
        refresh = res.data['refresh']
        response = self.client.post('/api/token/refresh/', {'refresh': refresh})
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)


class AthleteAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_superuser('admin', 'admin@test.com', 'admin123')
        res = self.client.post('/api/token/', {'username': 'admin', 'password': 'admin123'})
        self.token = res.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

    def test_create_athlete_fitness(self):
        data = {'full_name': 'John Doe', 'gym_type': 'fitness', 'gym_time': 'morning'}
        response = self.client.post('/api/athletes/', data)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['full_name'], 'John Doe')
        self.assertEqual(float(response.data['final_fee']), 1000.0)
        self.assertTrue(Payment.objects.filter(athlete__full_name='John Doe').exists())

    def test_create_athlete_bodybuilding(self):
        data = {'full_name': 'Jane Doe', 'gym_type': 'bodybuilding', 'gym_time': 'afternoon'}
        response = self.client.post('/api/athletes/', data)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(float(response.data['final_fee']), 700.0)

    def test_create_athlete_with_discount(self):
        data = {'full_name': 'Bob', 'gym_type': 'fitness', 'gym_time': 'morning', 'discount': 200}
        response = self.client.post('/api/athletes/', data)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(float(response.data['final_fee']), 800.0)

    def test_list_athletes(self):
        Athlete.objects.create(full_name='A', gym_type='fitness', gym_time='morning',
                               fee_deadline_date=date.today() + timedelta(days=30), final_fee=1000)
        Athlete.objects.create(full_name='B', gym_type='bodybuilding', gym_time='night',
                               fee_deadline_date=date.today() + timedelta(days=30), final_fee=700)
        response = self.client.get('/api/athletes/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['results']), 2)

    def test_filter_by_gym_type(self):
        Athlete.objects.create(full_name='A', gym_type='fitness', gym_time='morning',
                               fee_deadline_date=date.today() + timedelta(days=30), final_fee=1000)
        Athlete.objects.create(full_name='B', gym_type='bodybuilding', gym_time='night',
                               fee_deadline_date=date.today() + timedelta(days=30), final_fee=700)
        response = self.client.get('/api/athletes/', {'gym_type': 'fitness'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['results']), 1)

    def test_renew_membership(self):
        athlete = Athlete.objects.create(full_name='Test', gym_type='fitness', gym_time='morning',
                                         fee_deadline_date=date.today() + timedelta(days=5), final_fee=1000)
        response = self.client.post(f'/api/athletes/{athlete.id}/renew/', {'duration': 30})
        self.assertEqual(response.status_code, 200)
        athlete.refresh_from_db()
        self.assertEqual(athlete.fee_deadline_date, date.today() + timedelta(days=30))

    def test_toggle_status(self):
        athlete = Athlete.objects.create(full_name='Test', gym_type='fitness', gym_time='morning',
                                         fee_deadline_date=date.today() + timedelta(days=30), final_fee=1000)
        self.assertTrue(athlete.is_active)
        response = self.client.post(f'/api/athletes/{athlete.id}/toggle_status/')
        self.assertEqual(response.status_code, 200)
        athlete.refresh_from_db()
        self.assertFalse(athlete.is_active)

    def test_delete_athlete(self):
        athlete = Athlete.objects.create(full_name='ToDelete', gym_type='fitness', gym_time='morning',
                                         fee_deadline_date=date.today() + timedelta(days=30), final_fee=1000)
        response = self.client.delete(f'/api/athletes/{athlete.id}/')
        self.assertEqual(response.status_code, 204)
        self.assertFalse(Athlete.objects.filter(id=athlete.id).exists())

    def test_unauthenticated_can_list(self):
        self.client.credentials()
        response = self.client.get('/api/athletes/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('results', response.data)


class ShelfAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_superuser('admin', 'admin@test.com', 'admin123')
        res = self.client.post('/api/token/', {'username': 'admin', 'password': 'admin123'})
        self.token = res.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

    def test_create_shelf(self):
        response = self.client.post('/api/shelves/', {'shelf_number': 'A1'})
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['status'], 'available')

    def test_list_shelves(self):
        Shelf.objects.create(shelf_number='A1')
        Shelf.objects.create(shelf_number='A2')
        response = self.client.get('/api/shelves/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)

    def test_delete_shelf(self):
        shelf = Shelf.objects.create(shelf_number='B1')
        response = self.client.delete(f'/api/shelves/{shelf.id}/')
        self.assertEqual(response.status_code, 204)


class DashboardAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_superuser('admin', 'admin@test.com', 'admin123')
        res = self.client.post('/api/token/', {'username': 'admin', 'password': 'admin123'})
        self.token = res.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

    def test_dashboard_stats(self):
        deadline = date.today() + timedelta(days=30)
        s = Shelf.objects.create(shelf_number='L1')
        a = Athlete.objects.create(full_name='Test', gym_type='fitness', gym_time='morning',
                                   fee_deadline_date=deadline, final_fee=1000, shelf=s)
        Payment.objects.create(athlete=a, amount=1000, payment_type='registration')
        response = self.client.get('/api/dashboard/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['stats']['total'], 1)
        self.assertEqual(response.data['stats']['active'], 1)
        self.assertEqual(response.data['stats']['income'], 1000.0)

    def test_dashboard_alerts(self):
        deadline = date.today() - timedelta(days=1)
        Athlete.objects.create(full_name='Overdue', gym_type='fitness', gym_time='morning',
                               fee_deadline_date=deadline, final_fee=1000)
        response = self.client.get('/api/dashboard/')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(len(response.data['alerts']) > 0)
