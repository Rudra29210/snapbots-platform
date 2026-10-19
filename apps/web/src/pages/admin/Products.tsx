import { useEffect, useState, type FormEvent } from 'react';
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { Seo } from '@/components/layout/Seo';
import { getFirebase } from '@/lib/firebase';

type ProductStatus = 'draft' | 'published' | 'archived';

interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  imageUrl: string;
  status: ProductStatus;
}

const emptyForm = {
  name: '',
  sku: '',
  description: '',
  category: 'Robotics',
  price: '',
  stock: '0',
  status: 'draft' as ProductStatus,
};

const categories = [
  'Robotics',
  'Microcontrollers',
  'Sensors',
  'Motors & Drivers',
  'Kits',
  'Accessories',
  'Other',
];

const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024;
const MAX_IMAGE_DATA_URL_LENGTH = 650 * 1024;
const MAX_DOCUMENT_ESTIMATE = 900 * 1024;

async function compressImageToDataUrl(file: File): Promise<string> {
  const objectUrl = URL.createObjectURL(file);
  const image = new Image();

  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () =>
        reject(new Error('Unable to open this image. Try another JPG, PNG, or WebP file.'));
      image.src = objectUrl;
    });

    const maxDimension = 1200;
    const scale = Math.min(
      1,
      maxDimension / Math.max(image.naturalWidth, image.naturalHeight),
    );

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Image compression is not available in this browser.');
    }

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    for (const quality of [0.82, 0.7, 0.58, 0.46, 0.34, 0.25]) {
      const dataUrl = canvas.toDataURL('image/webp', quality);

      if (
        dataUrl.startsWith('data:image/webp;base64,') &&
        dataUrl.length <= MAX_IMAGE_DATA_URL_LENGTH
      ) {
        return dataUrl;
      }
    }

    throw new Error(
      'This image is too large to fit safely in a Firestore document after compression. Please choose a smaller image.',
    );
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const firebase = getFirebase();

    if (!firebase) {
      setError('Firebase is not configured. Check your environment variables.');
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      collection(firebase.db, 'products'),
      (snapshot) => {
        const items = snapshot.docs.map((item) => {
          const data = item.data();

          return {
            id: item.id,
            name: String(data.name ?? ''),
            sku: String(data.sku ?? ''),
            description: String(data.description ?? ''),
            category: String(data.category ?? 'Robotics'),
            price: Number(data.price ?? 0),
            stock: Number(data.stock ?? 0),
            imageUrl: String(data.imageUrl ?? ''),
            status: (data.status ?? 'draft') as ProductStatus,
          };
        });

        setProducts(items.sort((a, b) => a.name.localeCompare(b.name)));
        setLoading(false);
        setError('');
      },
      (err) => {
        console.error('Products listener failed:', err);
        setError(
          'Unable to load products. Check your Firestore security rules and administrator login.',
        );
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  function startNewProduct() {
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
    setError('');
    setShowForm(true);
  }

  function startEditing(product: Product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      sku: product.sku,
      description: product.description,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
      status: product.status,
    });
    setImageFile(null);
    setError('');
    setShowForm(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const firebase = getFirebase();

    if (!firebase) {
      setError('Firebase is not configured.');
      return;
    }

    const price = Number(form.price);
    const stock = Number(form.stock);

    if (!form.name.trim() || !form.sku.trim()) {
      setError('Product name and SKU are required.');
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setError('Enter a valid, non-negative price.');
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setError('Stock must be a non-negative whole number.');
      return;
    }

    if (imageFile) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(imageFile.type)) {
        setError('Use a JPG, PNG, or WebP image.');
        return;
      }

      if (imageFile.size > MAX_IMAGE_FILE_SIZE) {
        setError('The original image must be smaller than 5 MB.');
        return;
      }
    }

    setSaving(true);
    setError('');

    try {
      let imageUrl = editingId
        ? products.find((product) => product.id === editingId)?.imageUrl ?? ''
        : '';

      if (imageFile) {
        imageUrl = await compressImageToDataUrl(imageFile);
      }

      const payload = {
        name: form.name.trim(),
        sku: form.sku.trim(),
        description: form.description.trim(),
        category: form.category,
        price,
        stock,
        imageUrl,
        status: form.status,
        updatedAt: serverTimestamp(),
      };

      // Prevent a document from approaching Firestore's 1 MiB limit.
      const estimatedSize = new TextEncoder().encode(
        JSON.stringify({
          ...payload,
          updatedAt: null,
          createdAt: editingId ? undefined : null,
        }),
      ).length;

      if (estimatedSize > MAX_DOCUMENT_ESTIMATE) {
        throw new Error(
          'The product data is too large for Firestore. Choose a smaller image or shorten the description.',
        );
      }

      if (editingId) {
        await updateDoc(doc(firebase.db, 'products', editingId), payload);
      } else {
        await addDoc(collection(firebase.db, 'products'), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      setImageFile(null);
      setError('');
    } catch (err) {
      console.error('Saving product failed:', err);

      const message = err instanceof Error ? err.message : '';

      if (
        message.toLowerCase().includes('permission') ||
        message.toLowerCase().includes('insufficient')
      ) {
        setError(
          'Firestore denied this save. Sign in with the administrator account and check the deployed Firestore rules.',
        );
      } else {
        setError(message || 'Could not save the product. Check your connection and Firestore configuration.');
      }
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(product: Product, status: ProductStatus) {
    const firebase = getFirebase();

    if (!firebase) {
      setError('Firebase is not configured.');
      return;
    }

    try {
      await updateDoc(doc(firebase.db, 'products', product.id), {
        status,
        updatedAt: serverTimestamp(),
      });
      setError('');
    } catch (err) {
      console.error('Updating product status failed:', err);
      setError('Unable to update product status. Check your administrator login and Firestore rules.');
    }
  }

  return (
    <section className="space-y-6">
      <Seo
        path="/admin/products"
        title="Products"
        description="Manage Snapbots products and catalogue."
      />

      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Store management</p>
          <h1 className="text-3xl font-semibold">Products</h1>
          <p className="mt-2 text-sm text-mute">
            Manage your robotics products, pricing, stock, and publishing status.
          </p>
        </div>

        <button
          type="button"
          onClick={startNewProduct}
          className="rounded-lg bg-[#F58220] px-5 py-3 font-semibold text-white transition hover:bg-orange-600"
        >
          + Add Product
        </button>
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-300"
        >
          {error}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-xl border border-white/10 p-5"
        >
          <h2 className="text-xl font-semibold">
            {editingId ? 'Edit product' : 'Add a new product'}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="block">Product name *</span>
              <input
                required
                maxLength={120}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-white/15 bg-transparent p-3"
                placeholder="ESP32 Development Board"
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="block">SKU *</span>
              <input
                required
                maxLength={60}
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="w-full rounded-lg border border-white/15 bg-transparent p-3"
                placeholder="SNAP-ESP32-001"
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="block">Category</span>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-lg border border-white/15 bg-transparent p-3"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm">
              <span className="block">Price (₹) *</span>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full rounded-lg border border-white/15 bg-transparent p-3"
                placeholder="399"
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="block">Stock quantity *</span>
              <input
                required
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full rounded-lg border border-white/15 bg-transparent p-3"
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="block">
                Product image (JPG, PNG, WebP; original max 5 MB)
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm"
              />
              <span className="block text-xs text-mute">
                Images are compressed in your browser and stored in Firestore, not Firebase Storage.
              </span>
            </label>
          </div>

          <label className="block space-y-2 text-sm">
            <span className="block">Description</span>
            <textarea
              rows={4}
              maxLength={5000}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-lg border border-white/15 bg-transparent p-3"
              placeholder="Describe product features, specifications, and compatibility."
            />
          </label>

          <label className="block space-y-2 text-sm">
            <span className="block">Publishing status</span>
            <select
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value as ProductStatus,
                })
              }
              className="w-full rounded-lg border border-white/15 bg-transparent p-3"
            >
              <option value="draft">Draft — not public</option>
              <option value="published">Published — public catalogue</option>
              <option value="archived">Archived</option>
            </select>
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#F58220] px-5 py-3 font-semibold text-white disabled:opacity-50"
            >
              {saving ? 'Compressing and saving…' : editingId ? 'Save changes' : 'Create product'}
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => {
                setShowForm(false);
                setError('');
              }}
              className="rounded-lg border border-white/15 px-5 py-3 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 p-4">
          <p className="text-sm text-mute">Total products</p>
          <p className="mt-2 text-2xl font-semibold">{products.length}</p>
        </div>

        <div className="rounded-xl border border-white/10 p-4">
          <p className="text-sm text-mute">Published</p>
          <p className="mt-2 text-2xl font-semibold">
            {products.filter((product) => product.status === 'published').length}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 p-4">
          <p className="text-sm text-mute">Drafts</p>
          <p className="mt-2 text-2xl font-semibold">
            {products.filter((product) => product.status === 'draft').length}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        {loading ? (
          <p className="p-6 text-sm text-mute">Loading products…</p>
        ) : products.length === 0 ? (
          <div className="p-10 text-center">
            <h2 className="text-lg font-semibold">No products yet</h2>
            <p className="mt-2 text-sm text-mute">
              Select Add Product to create your first catalogue item.
            </p>
          </div>
        ) : (
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b border-white/10 text-mute">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-white/5">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/5">
                          <span aria-hidden="true">📦</span>
                        </div>
                      )}

                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-mute">{product.sku}</p>
                        <p className="text-xs text-mute">{product.category}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">₹{product.price.toFixed(2)}</td>
                  <td className="p-4">{product.stock}</td>
                  <td className="p-4 capitalize">{product.status}</td>

                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => startEditing(product)}
                        className="rounded-md border border-white/15 px-3 py-2"
                      >
                        Edit
                      </button>

                      {product.status !== 'published' && (
                        <button
                          type="button"
                          onClick={() => changeStatus(product, 'published')}
                          className="rounded-md border border-white/15 px-3 py-2"
                        >
                          Publish
                        </button>
                      )}

                      {product.status === 'published' && (
                        <button
                          type="button"
                          onClick={() => changeStatus(product, 'draft')}
                          className="rounded-md border border-white/15 px-3 py-2"
                        >
                          Unpublish
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}