import { INode, INodeOutputsValue, INodeParams, INodeData, ICommonObject } from "../../src/Interface";


class TestNode implements INode {
    label: string;
    name: string;
    icon: string;
    type: string;
    version: number;
    category: string;
    baseClasses: string[];
    inputs?: INodeParams[] | undefined;
    output?: INodeOutputsValue[] | undefined;
    tags?: string[] | undefined;
    description?: string | undefined;

    constructor(fields?: { sessionId?: string}){
        this.label = "Test Node";
        this.name = "TestNode";
        this.version = 1.0;
        this.type = "TestNode";
        this.icon = "testnode.png";
        this.category = 'TestNode'
        this.description = 'This is a simple node'
        this.baseClasses = [this.type]

        this.inputs = [
            {
                label: 'Test Node Input',
                name: 'testNodeInput',
                type: 'testNodeInput'
            }
        ]
    }

    async init(): Promise<any> {
        return null
    }

    async run(nodeData: INodeData, input: string, options: ICommonObject): Promise<string> {
        return "helo world"
    }

}

module.exports = { nodeClass: TestNode }