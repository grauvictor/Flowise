import { ICommonObject, INode, INodeData, INodeParams } from '../../../src/Interface'
import { getBaseClasses, getCredentialData, getCredentialParam } from '../../../src/utils'
import {HuggingFaceEmbedding} from 'llamaindex'

class HuggingFaceEmbedding_Embeddings implements INode {
    label: string
    name: string
    version: number
    type: string
    icon: string
    category: string
    description: string
    baseClasses: string[]
    credential: INodeParams
    inputs: INodeParams[]

    constructor() {
        this.label = 'HuggingFace Embedding'
        this.name = 'huggingFaceEmbedding'
        this.version = 1.0
        this.type = 'EmbeddingModel'
        this.icon = 'HuggingFace.svg'
        this.category = 'Embeddings'
        this.description = 'HuggingFace model to generate embeddings for a given text'
        this.baseClasses = [this.type, ...getBaseClasses(HuggingFaceEmbedding)]
        this.inputs = [
            {
                label: 'Model',
                name: 'modelName',
                type: 'string',
                description: 'Huggingface model name',
                placeholder: 'sentence-transformers/distilbert-base-nli-mean-tokens',
                optional: false
            },
        ]
    }

    async init(nodeData: INodeData, _: string, options: ICommonObject): Promise<any> {
        const modelName = nodeData.inputs?.modelName as string

        const credentialData = await getCredentialData(nodeData.credential ?? '', options)
        const huggingFaceApiKey = getCredentialParam('huggingFaceApiKey', credentialData, nodeData)

        const obj: Partial<HuggingFaceEmbedding> = {
        }

        // if (modelName) obj.model_name = modelName

        const model = new HuggingFaceEmbedding(obj)
        return model
    }
}

module.exports = { nodeClass: HuggingFaceEmbedding_Embeddings }
