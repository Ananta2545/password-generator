"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "./UserContext";
import { encryptVaultItem, decryptVaultItem, type VaultItemData } from "@/app/lib/encryption";
export interface VaultItem {
  _id: string;
  encryptedData: string;
  tags: string[];
  createdAt: string;
  lastModified: string;
}
export interface DecryptedVaultItem extends VaultItemData {
  _id: string;
  tags: string[];
  createdAt: string;
  lastModified: string;
}
interface VaultContextType {
  items: DecryptedVaultItem[];
  loading: boolean;
  error: string;
  fetchItems: () => Promise<void>;
  createItem: (data: VaultItemData, tags?: string[]) => Promise<void>;
  updateItem: (id: string, data: VaultItemData, tags?: string[]) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  encryptionKey: string | null;
  setEncryptionKey: (key: string | null) => void;
  itemCount: number;
}
const VaultContext = createContext<VaultContextType | undefined>(undefined);
export function VaultProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [items, setItems] = useState<DecryptedVaultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [encryptionKey, setEncryptionKey] = useState<string | null>(null);
  const [itemCount, setItemCount] = useState(0);
  const fetchItems = async () => {
    if (!user || !encryptionKey) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/vault", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        const decryptedItems: DecryptedVaultItem[] = data.items.map((item: VaultItem) => {
          try {
            const decrypted = decryptVaultItem(item.encryptedData, encryptionKey);
            return {
              ...decrypted,
              _id: item._id,
              tags: item.tags,
              createdAt: item.createdAt,
              lastModified: item.lastModified,
            };
          } catch (err: unknown) {
            console.error(`Failed to decrypt item: ${err}`, item._id);
            return null;
          }
        }).filter(Boolean);
        setItems(decryptedItems);
      } else {
        setError(data.message || "Failed to fetch items");
      }
    } catch (err: unknown) {
      setError(`Failed to fetch vault items: ${err}`);
      console.error("Fetch items error:", err);
    } finally {
      setLoading(false);
    }
  };
  const createItem = async (data: VaultItemData, tags: string[] = []) => {
    if (!user || !encryptionKey) {
      throw new Error("Not authenticated or encryption key missing");
    }
    setLoading(true);
    setError("");
    try {
      const encrypted = encryptVaultItem(data, encryptionKey);
      const res = await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ encryptedData: encrypted, tags }),
        credentials: "include",
      });
      const result = await res.json();
      if (result.success) {
        const newItem: DecryptedVaultItem = {
          ...data,
          _id: result.item.id,
          tags,
          createdAt: result.item.createdAt,
          lastModified: result.item.lastModified,
        };
        setItems((prev) => [newItem, ...prev]);
        setItemCount((prev) => prev + 1);
      } else {
        throw new Error(result.message || "Failed to create item");
      }
    } catch (err: unknown) {
      let message = "Failed to create vault item";
      if(err instanceof Error){
        message = err.message;
      }
      setError(message || "Failed to create vault item");
      throw err;
    } finally {
      setLoading(false);
    }
  };
  const updateItem = async (id: string, data: VaultItemData, tags: string[] = []) => {
    if (!user || !encryptionKey) {
      throw new Error("Not authenticated or encryption key missing");
    }
    setLoading(true);
    setError("");
    try {
      const encrypted = encryptVaultItem(data, encryptionKey);
      const res = await fetch(`/api/vault/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ encryptedData: encrypted, tags }),
        credentials: "include",
      });
      const result = await res.json();
      if (result.success) {
        setItems((prev) =>
          prev.map((item) =>
            item._id === id
              ? { ...data, _id: id, tags, createdAt: item.createdAt, lastModified: result.item.lastModified }
              : item
          )
        );
      } else {
        throw new Error(result.message || "Failed to update item");
      }
    } catch (err: unknown) {
      let message = "Failed to update vault item";
      if(err instanceof Error){
        message = err.message;
      }
      setError(message || "Failed to update vault item");
      throw err;
    } finally {
      setLoading(false);
    }
  };
  const deleteItem = async (id: string) => {
    if (!user) {
      throw new Error("Not authenticated");
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/vault/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await res.json();
      if (result.success) {
        setItems((prev) => prev.filter((item) => item._id !== id));
        setItemCount((prev) => Math.max(0, prev - 1));
      } else {
        throw new Error(result.message || "Failed to delete item");
      }
    } catch (err: unknown) {
      let message = "Failed to delete vault item";
      if(err instanceof Error){
        message = err.message;
      }
      setError(message || "Failed to delete vault item");
      throw err;
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (user && encryptionKey) {
      fetchItems();
    } else {
      setItems([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, encryptionKey]);
  useEffect(() => {
    const fetchCount = async () => {
      if (!user) {
        setItemCount(0);
        return;
      }
      try {
        const res = await fetch("/api/vault/count", {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          setItemCount(data.count);
        }
      } catch (err) {
        console.error("Failed to fetch item count:", err);
      }
    };
    fetchCount();
  }, [user]);
  return (
    <VaultContext.Provider
      value={{
        items,
        loading,
        error,
        fetchItems,
        createItem,
        updateItem,
        deleteItem,
        encryptionKey,
        setEncryptionKey,
        itemCount,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
}
export function useVault() {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error("useVault must be used within VaultProvider");
  }
  return context;
}
