# todo/todo_api/urls.py : API urls.py
from django.urls import path, include, re_path
from .views import (
    TodoListApiView,
    TodoDetailApiView,
)

urlpatterns = [
    re_path('api', TodoListApiView.as_view()),
    path('api/<int:todo_id>/', TodoDetailApiView.as_view()),
]