import unittest
from mock import MagicMock, Mock

from xblock.field_data import DictFieldData

from mentoring import MentoringBlock, MRQBlock


class TestMRQBlock(unittest.TestCase):
    def test_runtime_constant_uuid(self):
        block = MentoringBlock(MagicMock(), DictFieldData({}), Mock())
        mrq1 = MRQBlock(block)
        uuid1 = mrq1.uuid
        # Doesn't change during objects lifetime.
        self.assertEquals(mrq1.uuid, uuid1)
        # Different instance returns a different uuid.
        mrq2 = MRQBlock(block)
        self.assertNotEquals(mrq2.uuid, uuid1)
