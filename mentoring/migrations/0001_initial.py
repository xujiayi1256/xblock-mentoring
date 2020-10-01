# -*- coding: utf-8 -*-

from django.db import migrations, models


class Migration(migrations.Migration):

    operations = [
        migrations.CreateModel(
            name='Answer',
            fields=[
                ('id', models.AutoField(primary_key=True)),
                ('name', models.CharField(max_length=50, db_index=True)),
                ('student_id', models.CharField(max_length=20, db_index=True)),
                ('student_input', models.TextField(default='', blank=True)),
                ('created_on', models.DateTimeField(auto_now_add=True, blank=True)),
                ('modified_on', models.DateTimeField(auto_now=True, blank=True)),
            ],
        ),
        migrations.AlterUniqueTogether(name='answer', unique_together=set([('student_id', 'name')])),
    ]
