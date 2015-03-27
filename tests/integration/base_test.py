# -*- coding: utf-8 -*-
#
# Copyright (C) 2014 Harvard
#
# Authors:
#          Xavier Antoviaque <xavier@antoviaque.org>
#
# This software's license gives you freedom; you can copy, convey,
# propagate, redistribute and/or modify this program under the terms of
# the GNU Affero General Public License (AGPL) as published by the Free
# Software Foundation (FSF), either version 3 of the License, or (at your
# option) any later version of the AGPL published by the FSF.
#
# This program is distributed in the hope that it will be useful, but
# WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero
# General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program in a file in the toplevel directory called
# "AGPLv3".  If not, see <http://www.gnu.org/licenses/>.
#

from xblockutils.base_test import SeleniumBaseTest
from selenium.webdriver.support.ui import WebDriverWait


class MentoringBaseTest(SeleniumBaseTest):
    module_name = __name__
    default_css_selector = 'div.mentoring'

    def wait_until_visible(self, elem):
        wait = WebDriverWait(elem, self.timeout)
        wait.until(lambda e: e.is_displayed(), u"{} should be hidden".format(elem.text))

    def popup_check(self, mentoring, item_feedbacks, do_submit=True):
        choices_list = mentoring.find_element_by_css_selector(".choices-list")

        submit = mentoring.find_element_by_css_selector('.submit input.input-main')

        for index, expected_feedback in enumerate(item_feedbacks):
            choice_wrapper = choices_list.find_elements_by_css_selector(".choice")[index]
            if do_submit:
                choice_wrapper.find_element_by_css_selector(".choice-selector input").click()  # clicking on actual radio button
                submit.click()
            item_feedback_icon = choice_wrapper.find_element_by_css_selector(".choice-result")
            choice_wrapper.click()
            item_feedback_icon.click()  # clicking on item feedback icon
            item_feedback_popup = choice_wrapper.find_element_by_css_selector(".choice-tips")
            self.assertTrue(item_feedback_popup.is_displayed())
            self.assertEqual(item_feedback_popup.text, expected_feedback)

            item_feedback_popup.click()
            self.assertTrue(item_feedback_popup.is_displayed())

            mentoring.click()
            self.assertFalse(item_feedback_popup.is_displayed())
