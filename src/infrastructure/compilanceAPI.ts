import { RestClient } from "./common/restClient";
import type { AxiosInstance } from "axios";
import { HttpStatusCode, AxiosError } from "axios";
import { InternalServerError } from "../err/appError";

export type ValidationDocumentType = {
  document: string;
  status: number;
  reason: string;
}
export class CompilanceAPI extends RestClient {
  private authCode: string | null = null;
  private accessToken: string | null =  null;
  private refreshToken: string | null = null;
  private isRefreshing = false;
  private failedQueue: any[] = [];

  constructor(instance: AxiosInstance) {
    super(instance)
    // this.instance.interceptors.response.use(
    //   response => response,
    //   async (error) => {
    //     const originalRequest = error.config;
  
    //     if (error.response?.status === 401 && !originalRequest._retry) {
    //       originalRequest._retry = true; // marca que já tentou refresh
  
    //       try {
    //         await this.refreshAccessToken(); // método que renova o token
    //         originalRequest.headers['Authorization'] = `Bearer ${this.accessToken}`;
    //         return this.instance(originalRequest); // reexecuta a requisição
    //       } catch (refreshError) {
    //         // Se falhar renovar o token, rejeita o erro
    //         return Promise.reject(refreshError);
    //       }
    //     }
  
    //     return Promise.reject(error);
    //   })
}

  //   this.instance.interceptors.response.use(
  //     response => response,
  // async error => {
  //   await this.refreshAccessToken()
  //   const originalRequest = error.config;

  //   if (error.response?.status === HttpStatusCode.Unauthorized && !originalRequest._retry) {
  //     if (this.isRefreshing) {
  //       return new Promise((resolve, reject) => {
  //         this.failedQueue.push({ resolve, reject });
  //       })
  //         .then(() => {
  //           originalRequest.headers['Authorization'] = `Bearer ${this.accessToken}`;
  //           return this.instance(originalRequest);
  //         })
  //         .catch(err => Promise.reject(err));
  //     }

  //     originalRequest._retry = true;
  //     this.isRefreshing = true;
  //     try {
  //       await this.refreshAccessToken();

  //       this.processQueue(null);
  //       originalRequest.headers['Authorization'] = `Bearer ${this.accessToken}`;
  //       return this.instance(originalRequest);
  //     } catch (err) {
  //       this.processQueue(err);
  //       await this.obtainAuthCode(); // fallback
  //       return Promise.reject(err);
  //     } finally {
  //       this.isRefreshing = false;
  //     }
  //   }

  //   return Promise.reject(error);
  // }
  //   );
  // }

  private async obtainAuthCode() {
    try{

      const response = await this.post(`/auth/code`, {
        "email": process.env.API_COMPILANCE_CUBOS_CLIENT,
        "password": process.env.API_COMPILANCE_CUBOS_SECRET
      });
      this.authCode = response.data.data.authCode
    } catch (error){

      throw new InternalServerError('Unable to obtain auth code.')


    }
  }

  private async createAccessToken() {
    try{

      const response = await this.post(`/auth/token`, {
        authCode: this.authCode
      });
      this.accessToken = response.data.data.accessToken;
      this.refreshToken = response.data.data.refreshToken;
    } catch(error){
      throw new InternalServerError('Unable to obtain access token.')

    }
  }

  private async refreshAccessToken() {
    try{
      const response = await this.instance.post('/auth/refresh', {
        refreshToken: this.refreshToken,
      });
      this.accessToken = response.data.data.accessToken
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === HttpStatusCode.Unauthorized) {
      this.refreshToken = null;
      this.accessToken = null;
      throw new Error('Refresh token expired');
    }
    throw error;
  }
  }
 
  protected async getHeaders() {
    const config = {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: ''
      },
    };

    if(!this.accessToken){
      await this.obtainAuthCode();
      await this.createAccessToken()
    }

    if (this.accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${this.accessToken}`;
    }

    return config.headers;
  };

  async validateCPF(data: {document: string}): Promise<ValidationDocumentType> {
    const headers = await this.getHeaders()
    try{
    const response = await this.post(`/cpf/validate`, data, headers);
    return response.data;
  } catch (error){
    throw new InternalServerError('Unable to validate document.')
  }
  }

  async validateCNPJ(data: {document: string}): Promise<ValidationDocumentType> {
    const headers = await this.getHeaders()

    try{
    const response = await this.post(`/cnpj/validate`, data,headers);
    return response.data;
  } catch (error){
    throw new InternalServerError('Unable to validate document.')
      
  }
  }

  async createTransaction(id: string) {
    const headers = await this.getHeaders()
    try{
      const response = await this.put(`/transaction/${id}`, {}, headers);
    return response.data;
    } catch (error){
        throw new InternalServerError('Unable to create transaction.')
    }
  }

  async getTransactionById(id: string) {
    const headers = await this.getHeaders()

    try{
      const response = await this.get(`/transaction/${id}`, {}, headers);
      return response.data;
    } catch (error){
      throw new InternalServerError('Unable to get transaction by id.')
  
    }
  }

  async getAllTransaction() {
    const headers = await this.getHeaders()
    try {
      const response = await this.get(`/transaction`,{},headers);
      return response.data;
    } catch (error){
      throw new InternalServerError('Unable to get transaction list.')

    }
  }
}


