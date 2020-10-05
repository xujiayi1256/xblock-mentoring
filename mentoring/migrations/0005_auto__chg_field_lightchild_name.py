# -*- coding: utf-8 -*-

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mentoring', '0004_auto__add_lightchild__add_unique_lightchild_student_id_course_id_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='lightchild',
            name='name',
            field=models.CharField(max_length=100, db_index=True),
        ),
    ]
