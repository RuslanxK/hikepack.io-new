import { apiService } from "@/lib/apiService";
import { CommunityBag } from "@/types/community";
import { ChangeLog } from "@/types/changelog";
import { TripItem } from "@/types/trip";
import { BagItem } from "@/types/bag";
import { Item } from "@/types/item";
import { User } from "@/types/login";
import { Article } from "@/types/article";
import { Category } from "@/types/category";
import { SharedData } from "@/types/share";



export const fetchCommunityBags = async (): Promise<CommunityBag[]> => {
  const response = await apiService.get<CommunityBag[]>("/bags/community");
  return response;
};


export const fetchChangeLogs = async (): Promise<ChangeLog[]> => {
  const response = await apiService.get<ChangeLog[]>("/changelogs");
  return response 
};

export const fetchTrips = async (
  page: number,
  limit: number,
  searchTerm: string
): Promise<{ data: TripItem[]; total: number }> => {
  const response = await apiService.get<{ data: TripItem[]; total: number }>(
    `/trips?page=${page}&limit=${limit}&searchTerm=${searchTerm}`
  );
  return response;
};


export const fetchTripById = async (id: string): Promise<TripItem> => {
  const response = await apiService.get<TripItem>(`/trips/${id}`);
  return response;
};


export const fetchBagsByTripId = async (
  id: string,
  page = 1,
  limit = 7,
  searchTerm = ""
): Promise<{ data: BagItem[]; total: number }> => {
  const response = await apiService.get<{ data: BagItem[]; total: number }>(
    `/bags?tripId=${id}&page=${page}&limit=${limit}&searchTerm=${searchTerm}`
  );
  return response;
};



export const createItem = async (newItem: object): Promise<Item> => {
  return await apiService.post("/items", newItem);
};


export const updateUser = async (data: User): Promise<void> => {
  await apiService.put("/user/update", data);
};


export const fetchArticles = async (): Promise<Article[]> => {
  const response = await apiService.get<Article[]>("/articles");
  return response;
};


export  const fetchArticleById = async (id: string): Promise<Article> => {
  const response = await apiService.get<Article>(`/articles/${id}`);
  return response;
};


export const fetchBagById = async (id: string, auth: boolean): Promise<BagItem> => {
  return await apiService.getById<BagItem>(`/bags`, id, { params: { auth } });
};

export const createCategory = async (data: object) => {
  return await apiService.post("/categories", data);
};

export const fetchCategoriesByBagId = async (
  bagId: string,
  auth: boolean
): Promise<Category[]> => {
  return await apiService.get<Category[]>(`/categories`, {
    params: { bagId, auth },
  });
};


export const updateArticleById = async (id: string, data: Partial<Article>): Promise<Article> => {
  const response = await apiService.put<Article, Partial<Article>>(`/articles/${id}`, data);
  return response;
};

export const fetchOwnerAndTripByBagId = async (bagId: string): Promise<SharedData> => {
  return await apiService.get<SharedData>(`/bags/${bagId}/owner-and-trip`);
};


