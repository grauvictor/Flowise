import { FlowiseMemory, ICommonObject, IMessage, INode, INodeData, INodeOutputsValue, INodeParams } from '../../../src/Interface'
import { LLM, ChatMessage, SimpleChatEngine, HuggingFaceEmbedding } from 'llamaindex'

class FineTuningEngine_LlamaIndex implements INode {
    label: string
    name: string
    version: number
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    tags: string[]
    inputs: INodeParams[]
    outputs: INodeOutputsValue[]
    sessionId?: string

    constructor(fields?: { sessionId?: string }) {
        this.label = 'Finetuning Engine'
        this.name = 'finetuningEngine'
        this.version = 1.0
        this.type = 'EmbeddingModel'
        this.icon = 'llamaindex.png'
        this.category = 'Engine'
        this.description = 'Simple engine to finetune an embedding model'
        this.baseClasses = [this.type]
        this.tags = ['LlamaIndex']
        this.inputs = [
            {
                label: 'Embedding Model',
                name: 'embeddingModel',
                type: 'EmbeddingModel'
            },
            {
                label: 'Training Dataset',
                name: 'trainingDataset',
                type: 'Dataset'
            },
            {
                label: 'Finetuning Type',
                name: 'finetuningType',
                type: 'string',
                placeholder: 'QLoRa'
            }
        ]
        this.sessionId = fields?.sessionId
    }

    async init(): Promise<any> {
        return null
    }

    async run(nodeData: INodeData, input: string, options: ICommonObject): Promise<string> {
        const model = nodeData.inputs?.model as LLM
        const systemMessagePrompt = nodeData.inputs?.systemMessagePrompt as string
        const memory = nodeData.inputs?.memory as FlowiseMemory
        const prependMessages = options?.prependMessages

        const chatHistory = [] as ChatMessage[]

        if (systemMessagePrompt) {
            chatHistory.push({
                content: systemMessagePrompt,
                role: 'user'
            })
        }

        const chatEngine = new SimpleChatEngine({ llm: model })

        const msgs = (await memory.getChatMessages(this.sessionId, false, prependMessages)) as IMessage[]
        for (const message of msgs) {
            if (message.type === 'apiMessage') {
                chatHistory.push({
                    content: message.message,
                    role: 'assistant'
                })
            } else if (message.type === 'userMessage') {
                chatHistory.push({
                    content: message.message,
                    role: 'user'
                })
            }
        }

        let text = ''
        let isStreamingStarted = false
        const isStreamingEnabled = options.socketIO && options.socketIOClientId

        if (isStreamingEnabled) {
            const stream = await chatEngine.chat({ message: input, chatHistory, stream: true })
            for await (const chunk of stream) {
                text += chunk.response
                if (!isStreamingStarted) {
                    isStreamingStarted = true
                    options.socketIO.to(options.socketIOClientId).emit('start', chunk.response)
                }

                options.socketIO.to(options.socketIOClientId).emit('token', chunk.response)
            }
        } else {
            const response = await chatEngine.chat({ message: input, chatHistory })
            text = response?.response
        }

        await memory.addChatMessages(
            [
                {
                    text: input,
                    type: 'userMessage'
                },
                {
                    text: text,
                    type: 'apiMessage'
                }
            ],
            this.sessionId
        )

        return text
    }
}

module.exports = { nodeClass: FineTuningEngine_LlamaIndex }
