export const DEFAULT_MODEL='anthropic/claude-haiku-5.5';
export const providers=[
 {id:'openrouter',name:'OpenRouter',region:'全球',baseUrl:'https://openrouter.ai/api/v1',protocol:'openai',model:DEFAULT_MODEL,description:'统一模型网关 · 默认 Claude Haiku 5.5'},
 {id:'deepseek',name:'DeepSeek',region:'国内',baseUrl:'https://api.deepseek.com/v1',protocol:'openai',model:'deepseek-chat'},
 {id:'qwen',name:'通义千问 · 百炼',region:'国内',baseUrl:'https://dashscope.aliyuncs.com/compatible-mode/v1',protocol:'openai',model:'qwen-plus'},
 {id:'zhipu',name:'智谱 GLM',region:'国内',baseUrl:'https://open.bigmodel.cn/api/paas/v4',protocol:'openai',model:''},
 {id:'moonshot',name:'月之暗面 Kimi',region:'国内',baseUrl:'https://api.moonshot.cn/v1',protocol:'openai',model:''},
 {id:'doubao',name:'火山方舟 · 豆包',region:'国内',baseUrl:'https://ark.cn-beijing.volces.com/api/v3',protocol:'openai',model:'',description:'使用模型 ID 或部署的 Endpoint ID'},
 {id:'siliconflow',name:'硅基流动',region:'国内',baseUrl:'https://api.siliconflow.cn/v1',protocol:'openai',model:''},
 {id:'minimax',name:'MiniMax',region:'国内',baseUrl:'https://api.minimax.io/v1',protocol:'openai',model:''},
 {id:'openai',name:'OpenAI',region:'海外',baseUrl:'https://api.openai.com/v1',protocol:'openai',model:''},
 {id:'anthropic',name:'Anthropic Claude',region:'海外',baseUrl:'https://api.anthropic.com/v1',protocol:'anthropic',model:'',description:'原生 Messages 与工具结果适配'},
 {id:'gemini',name:'Google Gemini',region:'海外',baseUrl:'https://generativelanguage.googleapis.com/v1beta/openai',protocol:'openai',model:''},
 {id:'custom',name:'自定义兼容接口',region:'自定义',baseUrl:'',protocol:'openai',model:'',description:'HTTPS · OpenAI Chat Completions 兼容'}
];
export const providerById=id=>providers.find(p=>p.id===id);
