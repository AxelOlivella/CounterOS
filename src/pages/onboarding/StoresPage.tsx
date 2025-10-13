import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { StoreForm } from "@/components/onboarding/StoreForm";
import { StoreList } from "@/components/onboarding/StoreList";
import { CSVUploadButton } from "@/components/onboarding/CSVUploadButton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { StoreFormData } from "@/lib/schemas/storeSchema";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";

export default function StoresPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stores, setStores] = useState<StoreFormData[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [storeCount, setStoreCount] = useState<"single" | "multiple">("single");

  // Load from sessionStorage on mount
  useEffect(() => {
    const savedStores = sessionStorage.getItem("onboarding_stores");
    const savedCount = sessionStorage.getItem("onboarding_store_count");
    
    if (savedCount) {
      setStoreCount(savedCount as "single" | "multiple");
    }
    
    if (savedStores) {
      try {
        const parsed = JSON.parse(savedStores);
        setStores(parsed);
        logger.debug("Tiendas cargadas desde sessionStorage", { count: parsed.length });
      } catch (error) {
        logger.error("Error al parsear tiendas guardadas", error);
      }
    }
  }, []);

  // Save to sessionStorage whenever stores change
  useEffect(() => {
    if (stores.length > 0) {
      sessionStorage.setItem("onboarding_stores", JSON.stringify(stores));
      logger.debug("Tiendas guardadas en sessionStorage", { count: stores.length });
    }
  }, [stores]);

  const handleAddStore = (data: StoreFormData) => {
    if (editingIndex !== null) {
      // Edit existing store
      const updated = [...stores];
      updated[editingIndex] = data;
      setStores(updated);
      setEditingIndex(null);
      toast({
        title: "Tienda actualizada",
        description: `${data.name} ha sido actualizada`,
      });
    } else {
      // Add new store
      setStores([...stores, data]);
      toast({
        title: "Tienda agregada",
        description: `${data.name} ha sido agregada`,
      });
    }

    // Hide form after adding (unless multiple stores)
    if (storeCount === "single") {
      setShowForm(false);
    } else {
      setShowForm(false);
    }
  };

  const handleEditStore = (index: number) => {
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleDeleteStore = (index: number) => {
    const updated = stores.filter((_, i) => i !== index);
    setStores(updated);
    toast({
      title: "Tienda eliminada",
      description: "La tienda ha sido eliminada de la lista",
    });
  };

  const handleCSVUpload = (csvStores: StoreFormData[]) => {
    setStores([...stores, ...csvStores]);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setShowForm(false);
  };

  const handleContinue = () => {
    if (stores.length === 0) {
      toast({
        title: "Agrega al menos una tienda",
        description: "Necesitas configurar al menos una tienda para continuar",
        variant: "destructive",
      });
      return;
    }

    logger.info("Onboarding: Usuario completó configuración de tiendas", { 
      count: stores.length 
    });
    navigate("/onboarding/upload");
  };

  const handleBack = () => {
    navigate("/onboarding/welcome");
  };

  const shouldShowForm = showForm || (stores.length === 0 && storeCount === "single");

  return (
    <OnboardingLayout currentStep={2}>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Paso 2: Configura tu{storeCount === "multiple" ? "s" : ""} tienda{storeCount === "multiple" ? "s" : ""}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Ingresa la información básica de tu{storeCount === "multiple" ? "s" : ""} tienda{storeCount === "multiple" ? "s" : ""}
          </p>
        </div>

        {/* Store Form */}
        {shouldShowForm && (
          <div>
            <h2 className="text-lg font-semibold mb-3">
              {editingIndex !== null ? "Editar tienda" : "Agrega tu tienda"}
            </h2>
            <StoreForm
              onSubmit={handleAddStore}
              onCancel={editingIndex !== null || stores.length > 0 ? handleCancelEdit : undefined}
              initialData={editingIndex !== null ? stores[editingIndex] : undefined}
              submitLabel={editingIndex !== null ? "Guardar cambios" : "Agregar tienda"}
            />
          </div>
        )}

        {/* Add More Button (for multiple stores) */}
        {storeCount === "multiple" && stores.length > 0 && !showForm && (
          <Button
            variant="outline"
            onClick={() => setShowForm(true)}
            className="w-full sm:w-auto gap-2"
          >
            <Plus className="w-4 h-4" />
            Agregar otra tienda
          </Button>
        )}

        {/* Store List */}
        {stores.length > 0 && (
          <StoreList
            stores={stores}
            onEdit={handleEditStore}
            onDelete={handleDeleteStore}
          />
        )}

        {/* CSV Upload (only for multiple stores) */}
        {storeCount === "multiple" && !showForm && (
          <CSVUploadButton onStoresLoaded={handleCSVUpload} />
        )}

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            className="w-full sm:w-auto gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Atrás
          </Button>
          <Button
            onClick={handleContinue}
            disabled={stores.length === 0}
            className="w-full sm:flex-1"
          >
            Siguiente: Subir datos →
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
