import { categories } from '../data/products.js';

export const categorySlug = name => categories.find(category => category.name === name)?.slug ?? '';

export function searchProducts(products, query = '') {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [...products];
  return products.filter(product => {
    const haystack = [product.name, product.category, ...product.tags, ...product.materials].join(' ').toLowerCase();
    return words.every(word => haystack.includes(word));
  });
}

export function filterProducts(products, { category = '', min = 0, max = Infinity, inStock = false, color = '' } = {}) {
  return products.filter(product =>
    (!category || categorySlug(product.category) === category) &&
    product.price_cents >= min && product.price_cents <= max &&
    (!(inStock || color) || product.variants.some(variant =>
      (!inStock || variant.stock > 0) && (!color || variant.color === color))));
}

export function sortProducts(products, sort = 'featured') {
  const result = [...products];
  if (sort === 'price-asc') return result.sort((a, b) => a.price_cents - b.price_cents);
  if (sort === 'price-desc') return result.sort((a, b) => b.price_cents - a.price_cents);
  if (sort === 'newest') return result.sort((a, b) => b.added.localeCompare(a.added));
  return result;
}

export const browseProducts = (products, { query = '', sort = 'featured', ...filters } = {}) =>
  sortProducts(filterProducts(searchProducts(products, query), filters), sort);
