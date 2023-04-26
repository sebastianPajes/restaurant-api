import { Expose } from "class-transformer";
import { IsArray, IsDefined, IsString } from "class-validator";

export interface MemoryVector {
    content: string;
    embedding: number[];
    metadata: Record<string, any>;
}
  
export interface Message {
    content: string
    role: string
}

export interface ChatRequestBody {
    model: string;
    messages: Message[];
}

export class ChatRequestDTO implements ChatRequestBody {
    @Expose()
    @IsDefined()
    @IsString()
    model: string;

    @Expose()
    @IsDefined()
    @IsArray()
    messages: Message[];
}