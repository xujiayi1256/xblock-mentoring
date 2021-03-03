# -*- coding: utf-8 -*-

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mentoring', '0003_auto__del_unique_answer_student_id_name__add_unique_answer_course_id_s'),
    ]

    operations = [
        migrations.CreateModel(
            name='LightChild',
            fields=[
                ('id', models.AutoField(primary_key=True)),
                ('name', models.CharField(max_length=50, db_index=True)),
                ('student_id', models.CharField(max_length=32, db_index=True)),
                ('course_id', models.CharField(max_length=50, db_index=True)),
                ('student_data', models.TextField(default='', blank=True)),
                ('created_on', models.DateTimeField(auto_now_add=True, blank=True)),
                ('modified_on', models.DateTimeField(auto_now=True, blank=True)),
            ]
        ),

        # Adding unique constraint on 'LightChild', fields ['student_id', 'course_id', 'name']
        migrations.AlterUniqueTogether(name='lightchild', unique_together=set([('student_id', 'course_id', 'name')])),
    ]
