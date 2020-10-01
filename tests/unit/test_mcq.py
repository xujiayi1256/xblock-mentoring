import unittest

from mock import MagicMock, Mock
from xblock.field_data import DictFieldData

from mentoring.mentoring import MentoringBlock
from mentoring.mcq import MCQBlock


class TestMCQBlock(unittest.TestCase):
    def test_runtime_constant_uuid(self):
        block = MentoringBlock(MagicMock(), DictFieldData({}), Mock())
        mcq1 = MCQBlock(block)
        uuid1 = mcq1.uuid
        # Doesn't change during objects lifetime.
        self.assertEqual(mcq1.uuid, uuid1)
        # Different instance returns a different uuid.
        mcq2 = MCQBlock(block)
        self.assertNotEqual(mcq2.uuid, uuid1)
