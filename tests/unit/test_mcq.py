import unittest
from mock import MagicMock, Mock

from xblock.field_data import DictFieldData

from mentoring import MentoringBlock, MCQBlock


class TestMCQBlock(unittest.TestCase):
    def test_runtime_constant_uuid(self):
        block = MentoringBlock(MagicMock(), DictFieldData({}), Mock())
        mcq1 = MCQBlock(block)
        uuid1 = mcq1.uuid
        # Doesn't change during objects lifetime.
        self.assertEquals(mcq1.uuid, uuid1)
        # Different instance returns a different uuid.
        mcq2 = MCQBlock(block)
        self.assertNotEquals(mcq2.uuid, uuid1)
