from django.test import TestCase
from rest_framework.test import APITestCase
from django.urls import reverse
from rest_framework import status

class AuthTests(APITestCase):
    def test_register_user(self):
        url = reverse('register')
        data = {'email': 'test@example.com', 'username': 'testuser', 'password': 'testpass123'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('id', response.data)

    def test_login_user(self):
        url = reverse('login')
        self.client.post(reverse('register'), {'email': 'test@example.com', 'username': 'testuser', 'password': 'testpass123'}, format='json')
        response = self.client.post(url, {'email': 'test@example.com', 'password': 'testpass123'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)


class AuthTests(APITestCase):
    def test_password_reset_request(self):
        url = reverse('password_reset')
        self.client.post(reverse('register'), {'email': 'resetuser@example.com', 'username': 'resetuser', 'password': 'resetpass789'}, format='json')
        response = self.client.post(url, {'email': 'resetuser@example.com'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)