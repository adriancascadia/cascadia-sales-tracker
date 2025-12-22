import { useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Product {
  id: number;
  name: string;
  sku?: string | null;
  price: string;
  description?: string | null;
  distributorId?: number | null;
}

interface Distributor {
  id: number;
  name: string;
}

interface ProductSelectorProps {
  products: Product[];
  distributors?: Distributor[];
  value: number;
  onSelect: (productId: number, price: string) => void;
  placeholder?: string;
}

export function ProductSelector({
  products,
  distributors,
  value,
  onSelect,
  placeholder = "Select product...",
}: ProductSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedProduct = products?.find((p) => p.id === value);

  const getDistributorName = (distributorId?: number) => {
    if (!distributorId || !distributors) return null;
    return distributors.find((d) => d.id === distributorId)?.name;
  };

  const filteredProducts = products?.filter((product) => {
    const query = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(query) ||
      product.sku?.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query)
    );
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedProduct ? (
            <div className="flex items-center gap-2 truncate">
              <span className="font-medium truncate">{selectedProduct.name}</span>
              {selectedProduct.sku && (
                <span className="text-xs text-muted-foreground">({selectedProduct.sku})</span>
              )}
              <span className="text-sm text-muted-foreground ml-auto">
                ${parseFloat(selectedProduct.price).toFixed(2)}
              </span>
            </div>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search products by name or SKU..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>No products found.</CommandEmpty>
            <CommandGroup>
              {filteredProducts?.map((product) => {
                const distributorName = getDistributorName(product.distributorId || undefined);
                return (
                  <CommandItem
                    key={product.id}
                    value={product.id.toString()}
                    onSelect={() => {
                      onSelect(product.id, product.price);
                      setOpen(false);
                      setSearchQuery("");
                    }}
                    className="flex flex-col items-start py-3"
                  >
                    <div className="flex items-center w-full">
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4 flex-shrink-0",
                          value === product.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium truncate">{product.name}</span>
                          <span className="text-sm font-semibold text-primary whitespace-nowrap">
                            ${parseFloat(product.price).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          {product.sku && (
                            <span className="bg-muted px-1.5 py-0.5 rounded">
                              SKU: {product.sku}
                            </span>
                          )}
                          {distributorName && (
                            <span className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">
                              📦 {distributorName}
                            </span>
                          )}
                        </div>
                        {product.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
