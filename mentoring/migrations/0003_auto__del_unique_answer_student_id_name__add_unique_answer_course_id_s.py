# -*- coding: utf-8 -*-

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('mentoring', '0002_auto__add_field_answer_course_id__chg_field_answer_student_id'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='answer',
            unique_together=set([('course_id', 'student_id', 'name')]),
        ),
    ]
