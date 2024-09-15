import os
from importlib import reload
from typing import List

import requests
from autogen import (
    AssistantAgent,
    ConversableAgent,
    GroupChat,
    GroupChatManager,
    UserProxyAgent,
)
from autogen.coding import (
    CodeBlock,
    CodeExecutor,
    CodeExtractor,
    CodeResult,
    MarkdownCodeExtractor,
)
from IPython import get_ipython
from typing_extensions import Annotated


class NotebookExecutor(CodeExecutor):

    @property
    def code_extractor(self) -> CodeExtractor:
        # Extact code from markdown blocks.
        return MarkdownCodeExtractor()

    def __init__(self) -> None:
        # Get the current IPython instance running in this notebook.
        self._ipython = get_ipython()

    def execute_code_blocks(self, code_blocks: List[CodeBlock]) -> CodeResult:
        log = ""
        for code_block in code_blocks:
            result = self._ipython.run_cell(
                "%%capture --no-display cap\n" + code_block.code
            )
            log += self._ipython.ev("cap.stdout")
            log += self._ipython.ev("cap.stderr")
            if result.result is not None:
                log += str(result.result)
            exitcode = 0 if result.success else 1
            if result.error_before_exec is not None:
                log += f"\n{result.error_before_exec}"
                exitcode = 1
            if result.error_in_exec is not None:
                log += f"\n{result.error_in_exec}"
                exitcode = 1
            if exitcode != 0:
                break
        return CodeResult(exit_code=exitcode, output=log)
