import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, Plus, Trash2, Loader2, ExternalLink, Pencil, Link2,
  ShoppingBag, User, Palette, Globe,
} from "lucide-react";
import { SiX, SiInstagram, SiTiktok, SiYoutube, SiLinkedin } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient as qc } from "@/lib/queryClient";
import { Link } from "wouter";
import Footer from "@/components/Footer";
import type { BioPage, BioPageProduct } from "@shared/schema";

interface BioLink {
  title: string;
  url: string;
}

interface SocialLinks {
  twitter?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  linkedin?: string;
}

interface NewProduct {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
}

const THEMES = [
  { value: "default", label: "Default" },
  { value: "ocean", label: "Ocean" },
  { value: "sunset", label: "Sunset" },
  { value: "forest", label: "Forest" },
  { value: "purple", label: "Purple" },
  { value: "minimal", label: "Minimal" },
];

const THEME_COLORS: Record<string, { bg: string; accent: string; text: string }> = {
  default: { bg: "bg-black", accent: "text-lime-400", text: "text-white" },
  ocean: { bg: "bg-blue-950", accent: "text-cyan-400", text: "text-white" },
  sunset: { bg: "bg-orange-950", accent: "text-orange-400", text: "text-white" },
  forest: { bg: "bg-green-950", accent: "text-emerald-400", text: "text-white" },
  purple: { bg: "bg-purple-950", accent: "text-purple-400", text: "text-white" },
  minimal: { bg: "bg-zinc-100", accent: "text-zinc-900", text: "text-zinc-800" },
};

const emptyForm = {
  slug: "",
  title: "",
  description: "",
  theme: "default",
  avatarUrl: "",
  links: [] as BioLink[],
  socialLinks: { twitter: "", instagram: "", tiktok: "", youtube: "", linkedin: "" } as SocialLinks,
  shopEnabled: false,
};

export default function BioPageBuilder() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newProduct, setNewProduct] = useState<NewProduct>({ name: "", description: "", price: "", imageUrl: "" });

  const { data: myPages = [], isLoading: pagesLoading } = useQuery<(BioPage & { products?: BioPageProduct[] })[]>({
    queryKey: ["/api/bio/my-pages"],
    enabled: isAuthenticated,
    select: (data: any) => data?.pages || data || [],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await apiRequest("POST", "/api/bio/create", {
        ...data,
        userId: user?.id,
        price: undefined,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bio/my-pages"] });
      toast({ title: "Bio Page Created", description: "Your new bio page is live." });
      resetForm();
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof form }) => {
      const res = await apiRequest("PATCH", `/api/bio/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bio/my-pages"] });
      toast({ title: "Bio Page Updated", description: "Changes saved." });
      resetForm();
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/bio/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bio/my-pages"] });
      toast({ title: "Deleted", description: "Bio page removed." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const addProductMutation = useMutation({
    mutationFn: async ({ bioPageId, product }: { bioPageId: number; product: NewProduct }) => {
      const res = await apiRequest("POST", `/api/bio/${bioPageId}/products`, {
        bioPageId,
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        imageUrl: product.imageUrl || null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bio/my-pages"] });
      setNewProduct({ name: "", description: "", price: "", imageUrl: "" });
      toast({ title: "Product Added" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      await apiRequest("DELETE", `/api/bio/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bio/my-pages"] });
      toast({ title: "Product Removed" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
  };

  const startEdit = (page: BioPage) => {
    setEditingId(page.id);
    setForm({
      slug: page.slug,
      title: page.title,
      description: page.description || "",
      theme: page.theme || "default",
      avatarUrl: page.avatarUrl || "",
      links: (page.links as BioLink[]) || [],
      socialLinks: { twitter: "", instagram: "", tiktok: "", youtube: "", linkedin: "", ...(page.socialLinks as SocialLinks || {}) },
      shopEnabled: page.shopEnabled || false,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = () => {
    if (!form.slug || !form.title) {
      toast({ title: "Required Fields", description: "Slug and title are required.", variant: "destructive" });
      return;
    }
    if (!/^[a-zA-Z0-9-_]+$/.test(form.slug)) {
      toast({ title: "Invalid Slug", description: "Only letters, numbers, hyphens, and underscores.", variant: "destructive" });
      return;
    }
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const addLink = () => {
    setForm((f) => ({ ...f, links: [...f.links, { title: "", url: "" }] }));
  };

  const removeLink = (idx: number) => {
    setForm((f) => ({ ...f, links: f.links.filter((_, i) => i !== idx) }));
  };

  const updateLink = (idx: number, field: "title" | "url", value: string) => {
    setForm((f) => ({
      ...f,
      links: f.links.map((l, i) => (i === idx ? { ...l, [field]: value } : l)),
    }));
  };

  const themeColors = THEME_COLORS[form.theme] || THEME_COLORS.default;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-lime-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
        <p className="text-slate-400">Please log in to build your bio page.</p>
        <Link href="/login">
          <Button className="bg-lime-400 text-black" data-testid="button-login">Log In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-4 flex-wrap">
          <Link href="/">
            <Button variant="ghost" className="text-slate-400" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="bg-lime-500/10 p-3 rounded-2xl">
              <User className="w-8 h-8 text-lime-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" data-testid="text-page-title">Link-in-Bio Builder</h1>
              <p className="text-slate-400 text-sm">Create and manage your bio pages</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <Card className="bg-slate-900 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Globe className="w-5 h-5 text-lime-400" />
                  {editingId ? "Edit Bio Page" : "Create Bio Page"}
                  {editingId && (
                    <Button variant="ghost" size="sm" onClick={resetForm} className="ml-auto text-slate-400" data-testid="button-cancel-edit">
                      Cancel
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Slug</Label>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500 text-xs whitespace-nowrap">/b/</span>
                      <Input
                        placeholder="my-page"
                        value={form.slug}
                        onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                        className="bg-black border-white/10"
                        data-testid="input-slug"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      placeholder="My Awesome Page"
                      value={form.title}
                      onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                      className="bg-black border-white/10"
                      data-testid="input-title"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="A short bio or description..."
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="bg-black border-white/10 resize-none"
                    rows={2}
                    data-testid="input-description"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1"><Palette className="w-3 h-3" /> Theme</Label>
                    <Select value={form.theme} onValueChange={(v) => setForm((f) => ({ ...f, theme: v }))}>
                      <SelectTrigger className="bg-black border-white/10" data-testid="select-theme">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {THEMES.map((t) => (
                          <SelectItem key={t.value} value={t.value} data-testid={`option-theme-${t.value}`}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Avatar URL</Label>
                    <Input
                      placeholder="https://example.com/avatar.png"
                      value={form.avatarUrl}
                      onChange={(e) => setForm((f) => ({ ...f, avatarUrl: e.target.value }))}
                      className="bg-black border-white/10"
                      data-testid="input-avatar-url"
                    />
                  </div>
                </div>

                <Separator className="border-white/10" />

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <Label className="flex items-center gap-1"><Link2 className="w-3 h-3" /> Links</Label>
                    <Button variant="ghost" size="sm" onClick={addLink} data-testid="button-add-link">
                      <Plus className="w-4 h-4 mr-1" /> Add Link
                    </Button>
                  </div>
                  {form.links.map((link, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        placeholder="Link title"
                        value={link.title}
                        onChange={(e) => updateLink(idx, "title", e.target.value)}
                        className="bg-black border-white/10 flex-1"
                        data-testid={`input-link-title-${idx}`}
                      />
                      <Input
                        placeholder="https://..."
                        value={link.url}
                        onChange={(e) => updateLink(idx, "url", e.target.value)}
                        className="bg-black border-white/10 flex-1"
                        data-testid={`input-link-url-${idx}`}
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeLink(idx)} data-testid={`button-remove-link-${idx}`}>
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                  ))}
                  {form.links.length === 0 && (
                    <p className="text-xs text-slate-500">No links yet. Add one above.</p>
                  )}
                </div>

                <Separator className="border-white/10" />

                <div className="space-y-3">
                  <Label>Social Links</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {([
                      { key: "twitter", icon: SiX, placeholder: "https://twitter.com/..." },
                      { key: "instagram", icon: SiInstagram, placeholder: "https://instagram.com/..." },
                      { key: "tiktok", icon: SiTiktok, placeholder: "https://tiktok.com/@..." },
                      { key: "youtube", icon: SiYoutube, placeholder: "https://youtube.com/..." },
                      { key: "linkedin", icon: SiLinkedin, placeholder: "https://linkedin.com/in/..." },
                    ] as const).map(({ key, icon: Icon, placeholder }) => (
                      <div key={key} className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-slate-400 shrink-0" />
                        <Input
                          placeholder={placeholder}
                          value={(form.socialLinks as Record<string, string>)[key] || ""}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              socialLinks: { ...f.socialLinks, [key]: e.target.value },
                            }))
                          }
                          className="bg-black border-white/10"
                          data-testid={`input-social-${key}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="border-white/10" />

                <div className="flex items-center justify-between gap-2">
                  <Label className="flex items-center gap-1"><ShoppingBag className="w-3 h-3" /> Enable Shop</Label>
                  <Switch
                    checked={form.shopEnabled}
                    onCheckedChange={(v) => setForm((f) => ({ ...f, shopEnabled: v }))}
                    data-testid="switch-shop"
                  />
                </div>

                {form.shopEnabled && editingId && (
                  <div className="space-y-3 p-4 rounded-md border border-white/10 bg-black/50">
                    <Label>Add Product</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        placeholder="Product name"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct((p) => ({ ...p, name: e.target.value }))}
                        className="bg-black border-white/10"
                        data-testid="input-product-name"
                      />
                      <Input
                        placeholder="Price (e.g. 9.99)"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct((p) => ({ ...p, price: e.target.value }))}
                        className="bg-black border-white/10"
                        data-testid="input-product-price"
                      />
                      <Input
                        placeholder="Description"
                        value={newProduct.description}
                        onChange={(e) => setNewProduct((p) => ({ ...p, description: e.target.value }))}
                        className="bg-black border-white/10"
                        data-testid="input-product-description"
                      />
                      <Input
                        placeholder="Image URL"
                        value={newProduct.imageUrl}
                        onChange={(e) => setNewProduct((p) => ({ ...p, imageUrl: e.target.value }))}
                        className="bg-black border-white/10"
                        data-testid="input-product-image"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-lime-400/50 text-lime-400"
                      disabled={!newProduct.name || !newProduct.price || addProductMutation.isPending}
                      onClick={() => addProductMutation.mutate({ bioPageId: editingId, product: newProduct })}
                      data-testid="button-add-product"
                    >
                      {addProductMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Plus className="w-3 h-3 mr-1" />}
                      Add Product
                    </Button>

                    {(() => {
                      const currentPage = myPages.find((p) => p.id === editingId);
                      const products = currentPage?.products || [];
                      if (products.length === 0) return null;
                      return (
                        <div className="space-y-2 mt-2">
                          {products.map((prod) => (
                            <div key={prod.id} className="flex items-center justify-between gap-2 p-2 rounded-md bg-slate-900 border border-white/5">
                              <div>
                                <p className="text-sm font-medium" data-testid={`text-product-name-${prod.id}`}>{prod.name}</p>
                                <p className="text-xs text-slate-400">${(prod.price / 100).toFixed(2)}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteProductMutation.mutate(prod.id)}
                                disabled={deleteProductMutation.isPending}
                                data-testid={`button-delete-product-${prod.id}`}
                              >
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                )}

                <Button
                  className="w-full bg-lime-400 text-black font-bold"
                  onClick={handleSubmit}
                  disabled={isSaving}
                  data-testid="button-save"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  {editingId ? "Update Bio Page" : "Create Bio Page"}
                </Button>
              </CardContent>
            </Card>

            {pagesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-lime-400" />
              </div>
            ) : myPages.length > 0 ? (
              <Card className="bg-slate-900 border-white/10">
                <CardHeader>
                  <CardTitle className="text-lg">Your Bio Pages</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {myPages.map((page) => (
                    <div
                      key={page.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-md border border-white/5 bg-black/30"
                      data-testid={`card-bio-page-${page.id}`}
                    >
                      <div className="min-w-0">
                        <p className="font-medium truncate" data-testid={`text-bio-title-${page.id}`}>{page.title}</p>
                        <a
                          href={`/b/${page.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-lime-400 hover:underline flex items-center gap-1"
                          data-testid={`link-bio-slug-${page.id}`}
                        >
                          /b/{page.slug} <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="icon" onClick={() => startEdit(page)} data-testid={`button-edit-bio-${page.id}`}>
                          <Pencil className="w-4 h-4 text-slate-400" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(page.id)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-bio-${page.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}
          </div>

          <div className="lg:col-span-2">
            <div className="sticky top-8">
              <Label className="text-xs text-slate-500 uppercase tracking-wider mb-3 block">Live Preview</Label>
              <Card className="border-white/10 overflow-hidden">
                <div className={`${themeColors.bg} p-6 min-h-[480px] flex flex-col items-center`} data-testid="preview-panel">
                  {form.avatarUrl ? (
                    <img
                      src={form.avatarUrl}
                      alt="Avatar"
                      className="w-20 h-20 rounded-full object-cover border-2 border-white/20 mb-3"
                      data-testid="preview-avatar"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-3">
                      <User className="w-8 h-8 text-white/30" />
                    </div>
                  )}

                  <h2 className={`text-xl font-bold ${themeColors.text} text-center`} data-testid="preview-title">
                    {form.title || "Your Title"}
                  </h2>
                  {form.description && (
                    <p className={`text-sm mt-1 text-center opacity-70 ${themeColors.text}`} data-testid="preview-description">
                      {form.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-3">
                    {form.socialLinks.twitter && <SiX className={`w-4 h-4 ${themeColors.accent}`} />}
                    {form.socialLinks.instagram && <SiInstagram className={`w-4 h-4 ${themeColors.accent}`} />}
                    {form.socialLinks.tiktok && <SiTiktok className={`w-4 h-4 ${themeColors.accent}`} />}
                    {form.socialLinks.youtube && <SiYoutube className={`w-4 h-4 ${themeColors.accent}`} />}
                    {form.socialLinks.linkedin && <SiLinkedin className={`w-4 h-4 ${themeColors.accent}`} />}
                  </div>

                  <div className="w-full mt-5 space-y-2">
                    {form.links.map((link, idx) => (
                      <div
                        key={idx}
                        className="w-full rounded-md border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-medium"
                        data-testid={`preview-link-${idx}`}
                      >
                        <span className={themeColors.text}>{link.title || "Untitled Link"}</span>
                      </div>
                    ))}
                  </div>

                  {form.shopEnabled && (
                    <div className="w-full mt-5">
                      <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${themeColors.accent}`}>Shop</p>
                      {editingId && (() => {
                        const currentPage = myPages.find((p) => p.id === editingId);
                        const products = currentPage?.products || [];
                        return products.map((prod) => (
                          <div key={prod.id} className="flex items-center gap-2 p-2 rounded-md bg-white/5 border border-white/10 mb-2">
                            {prod.imageUrl && (
                              <img src={prod.imageUrl} alt={prod.name} className="w-10 h-10 rounded-md object-cover" />
                            )}
                            <div className="min-w-0">
                              <p className={`text-sm font-medium truncate ${themeColors.text}`}>{prod.name}</p>
                              <p className={`text-xs ${themeColors.accent}`}>${(prod.price / 100).toFixed(2)}</p>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  )}

                  {form.slug && (
                    <p className="mt-auto pt-4 text-xs opacity-40 text-center">
                      <span className={themeColors.text}>/b/{form.slug}</span>
                    </p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}