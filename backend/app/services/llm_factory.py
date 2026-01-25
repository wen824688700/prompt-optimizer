"""
LLM 服务工厂
根据模型类型创建相应的 LLM 服务实例
"""
from ..config import Settings
from .base_llm import BaseLLMService
from .gemini_service import GeminiService
from .llm_service import DeepSeekService


class LLMFactory:
    """LLM 服务工厂类"""

    @staticmethod
    def create_service(model: str, settings: Settings) -> BaseLLMService:
        """
        根据模型类型创建 LLM 服务实例（使用环境变量中的 API 密钥）

        Args:
            model: 模型标识符 ('deepseek' 或 'gemini')
            settings: 应用配置

        Returns:
            BaseLLMService 实例

        Raises:
            ValueError: 不支持的模型类型
        """
        model = model.lower()

        if model == 'deepseek':
            if not settings.deepseek_api_key:
                raise ValueError("Missing DEEPSEEK_API_KEY (deepseek_api_key) in environment")
            return DeepSeekService(
                api_key=settings.deepseek_api_key,
                base_url=settings.deepseek_base_url
            )
        elif model == 'gemini':
            if not settings.gemini_api_key:
                raise ValueError("Missing GEMINI_API_KEY (gemini_api_key) in environment")
            return GeminiService(
                api_key=settings.gemini_api_key,
                base_url=settings.gemini_base_url
            )
        else:
            raise ValueError(f"不支持的模型类型: {model}。支持的模型: deepseek, gemini")

    @staticmethod
    def create_service_with_key(model: str, api_key: str, settings: Settings | None = None) -> BaseLLMService:
        """
        根据模型类型和用户提供的 API 密钥创建 LLM 服务实例

        Args:
            model: 模型标识符 ('deepseek' 或 'gemini')
            api_key: 用户提供的 API 密钥
            settings: 应用配置（可选，用于获取 base_url）

        Returns:
            BaseLLMService 实例

        Raises:
            ValueError: 不支持的模型类型或缺少 API 密钥
        """
        model = model.lower()

        if not api_key:
            raise ValueError("API 密钥不能为空")

        if model == 'deepseek':
            base_url = settings.deepseek_base_url if settings else "https://api.deepseek.com"
            return DeepSeekService(
                api_key=api_key,
                base_url=base_url
            )
        elif model == 'gemini':
            base_url = settings.gemini_base_url if settings else "https://generativelanguage.googleapis.com"
            return GeminiService(
                api_key=api_key,
                base_url=base_url
            )
        else:
            raise ValueError(f"不支持的模型类型: {model}。支持的模型: deepseek, gemini")

    @staticmethod
    def get_supported_models():
        """获取支持的模型列表"""
        return ['deepseek', 'gemini']
