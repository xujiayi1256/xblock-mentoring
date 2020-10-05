# -*- coding: utf-8 -*-

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mentoring', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='answer',
            name='course_id',
            field=models.CharField(default='default', max_length=50, db_index=True),
        ),

        migrations.AlterField(
            model_name='answer',
            name='student_id',
            field=models.CharField(max_length=32, db_index=True),
        ),
    ]
