import django_filters
from django.db.models import Q
from .models import Profile
from datetime import date

class ProfileFilter(django_filters.FilterSet):
    min_age = django_filters.NumberFilter(method='filter_min_age')
    max_age = django_filters.NumberFilter(method='filter_max_age')
    min_height = django_filters.NumberFilter(field_name='height', lookup_expr='gte')
    max_height = django_filters.NumberFilter(field_name='height', lookup_expr='lte')
    
    # Text searches
    education = django_filters.CharFilter(field_name='education', lookup_expr='icontains')
    occupation = django_filters.CharFilter(field_name='occupation', lookup_expr='icontains')
    nakshatram = django_filters.CharFilter(field_name='nakshatram', lookup_expr='iexact')
    rasi = django_filters.CharFilter(field_name='rasi', lookup_expr='iexact')
    gothram = django_filters.CharFilter(field_name='gothram', lookup_expr='iexact')
    location = django_filters.CharFilter(method='filter_location')

    class Meta:
        model = Profile
        fields = ['education', 'occupation', 'nakshatram', 'rasi', 'gothram', 'gender', 'marital_status']

    def filter_min_age(self, queryset, name, value):
        today = date.today()
        # min_age means user is born before (today - min_age years)
        limit_date = date(today.year - int(value), today.month, today.day)
        return queryset.filter(dob__lte=limit_date)

    def filter_max_age(self, queryset, name, value):
        today = date.today()
        # max_age means user is born after (today - max_age years - 1 year)
        limit_date = date(today.year - int(value) - 1, today.month, today.day)
        return queryset.filter(dob__gte=limit_date)

    def filter_location(self, queryset, name, value):
        return queryset.filter(
            Q(address__icontains=value) | 
            Q(birth_place__icontains=value)
        )
