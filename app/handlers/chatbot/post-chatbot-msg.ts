import 'reflect-metadata';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { apiGatewayWrapper } from '../../lib/helpers/wrappers/apiGatewayWrapper';
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import * as AWS from 'aws-sdk';
import { ChatRequestDTO, MemoryVector, Message } from '../../models/Chatbot';
import { validationWrapper } from '../../lib/helpers/wrappers/validationWrapper';
import { Document } from 'langchain/document';
import { AIChatMessage, HumanChatMessage, SystemChatMessage } from 'langchain/schema';
import { ChatOpenAI } from 'langchain/chat_models/openai';

export const handler: APIGatewayProxyHandler = async (event, context) =>
  apiGatewayWrapper({
    context,
    callback: async () => {
        console.log('request:', JSON.stringify(event, undefined, 2));
        const openAIApiKey = process.env.OPEN_AI_KEY;
        const s3 = new AWS.S3();

        // Leer el archivo 'restaurant.txt' desde el bucket de S3
        const bucketName = process.env.BUCKET;
        const bucketKey = process.env.BUCKET_KEY;
        if (!bucketName) {
            throw new Error('Bucket name not found in environment variables');
        }

        const { model, messages } = await validationWrapper(ChatRequestDTO, event.body? JSON.parse(event.body) : {})

        const chat = new ChatOpenAI({ modelName: model, openAIApiKey, temperature: 0.1 });
        const vectorStore = new MemoryVectorStore(new OpenAIEmbeddings({openAIApiKey}))

        let s3MemoryVectors: MemoryVector[] = [];
        const s3Data = await s3.getObject({ Bucket: bucketName, Key: bucketKey }).promise();
        const fileContent = s3Data.Body?.toString() || '';
        const vectors = JSON.parse(fileContent);
        s3MemoryVectors.push(...vectors);
        const contentList = s3MemoryVectors.map(v => new Document({pageContent: v.content, metadata: v.metadata}))
        const embeddingList = s3MemoryVectors.map(v => v.embedding)
        await vectorStore.addVectors(embeddingList, contentList)


        const chatHistory = messages.map((message: Message) => {
        if (message.role === 'system') {
            return new SystemChatMessage(message.content);
        } else if (message.role === 'assistant') {
            return new AIChatMessage(message.content);
        } else if (message.role === 'user') {
            return new HumanChatMessage(message.content);
        } else {
            throw new Error(`Invalid role: ${message.role}`);
        }
        }); 
        
        const latestUserMessage = messages[messages.length - 1].content;
        const context = await getAllContentAsOneString(messages, vectorStore, chat);

        const now = new Date();
        const dayOfWeek = now.getDay();
        const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
        const dayName = days[dayOfWeek];
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const timeFormatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

        const finalMessage = `
        Dia: ${dayName}
        Hora: ${timeFormatted}
        contexto: ${context}
        consulta usuario: ${latestUserMessage}`;

        console.log(`FINAL MESSAGE: ${finalMessage}`)

        chatHistory.push(new HumanChatMessage(finalMessage));
        const response = await chat.call(chatHistory);
        const aiResponse = new AIChatMessage(response.text);

        return { message: 'Success', data: { 
            role: 'assistant',
            content: aiResponse.text,
        } };
    },
  });

  async function getAllContentAsOneString(messages: Message[], vectorStore: MemoryVectorStore, chat: ChatOpenAI) {

    const chatHistoryStr = messages.slice(-5, -1).reduce((acc, message, index) => {
      if (message.role === 'system') return acc;
      const messageStr = `${message.role}: ${message.content}`;
      return acc + (index === 0 ? messageStr : '\n' + messageStr);
    }, '');
  
    // console.log(`historial de conversacion: ${chatHistoryStr}`)
  
    const latestUserMessage = messages[messages.length - 1].content;
  
    let questionFormatted = latestUserMessage;
  
    if (chatHistoryStr.length > 0) {
      const standaloneQuestionRes = await chat.call([
        new HumanChatMessage(`Dada un historial de conversacion y una consulta del usuario quiero que crees un query que trate de contener algunas de las columnas basado en la consulta del usuario ya que ese query posteriormente sera transformado a vectores y jalara paginas de mi base de datos por similitud.
        columnas: nombre, platos, ubicacion, horario, precios y tiempo de espera promedio
        Historial de conversacion: ${chatHistoryStr}
        Consulta del usuario: ${latestUserMessage}
        query a base de datos (transformado a lenguaje natural):`)
      ])
      questionFormatted = standaloneQuestionRes.text
    }
  
    console.log(`questionFormatted: ${questionFormatted}`)
  
    let documents = await vectorStore.similaritySearch(questionFormatted, 12)
  
    console.log('-------DOCUMENTOS-------')
  
    console.log(documents);
  
    const combinedDocuments: { [key: string]: Document } = {};
  
    for (const doc of documents) {
      const nameMatch = doc.pageContent.match(/Nombre: (.+)(\n|$)/);
      const name = nameMatch ? nameMatch[1] : null;
    
      if (name) {
        if (combinedDocuments[name]) {
          combinedDocuments[name].pageContent += '\n' + doc.pageContent.replace(`Nombre: ${name}\n`, '');
        } else {
          combinedDocuments[name] = doc;
        }
      }
    }
    
    documents = Object.values(combinedDocuments);
  
    console.log('-------DOCUMENTOS COMBINADOS-------')
  
    console.log(documents);
  
    let allContent = "";
  
    let i = 1
    for (const doc of documents) {
      allContent += `pagina ${i}: \n` + doc.pageContent + "\n";
      i++
    }
  
    return allContent;
  }  
