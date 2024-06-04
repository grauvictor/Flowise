import client from './client'

const finetune = (id) => client.post(`/finetune/${id}`)

export default {
    finetune
}
