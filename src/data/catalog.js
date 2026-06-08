// 4 items per active store — single flat-lay garment images only
const retailCatalog = [
  // ── ZARA ──────────────────────────────────────────────────────────────────
  {
    id: 'zara_blazer_01', storeName: 'Zara', storeSlug: 'zara',
    title: 'Tailored Blazer', priceZAR: 1299, layerType: 'outer_body',
    productImageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=max&w=400&q=80',
    affiliateCheckoutUrl: 'https://www.zara.com/za/', isHotDeal: true, isNew: false, isTrending: true,
  },
  {
    id: 'zara_shirt_02', storeName: 'Zara', storeSlug: 'zara',
    title: 'Linen Stripe Shirt', priceZAR: 649, layerType: 'inner_body',
    productImageUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=max&w=400&q=80',
    affiliateCheckoutUrl: 'https://www.zara.com/za/', isHotDeal: false, isNew: true, isTrending: false,
  },
  {
    id: 'zara_trouser_03', storeName: 'Zara', storeSlug: 'zara',
    title: 'High-Waist Trousers', priceZAR: 849, layerType: 'lower_body',
    productImageUrl: 'https://images.unsplash.com/photo-1624378440082-c5ff2e97b555?auto=format&fit=max&w=400&q=80',
    affiliateCheckoutUrl: 'https://www.zara.com/za/', isHotDeal: true, isNew: false, isTrending: true,
  },
  {
    id: 'zara_dress_04', storeName: 'Zara', storeSlug: 'zara',
    title: 'Satin Slip Dress', priceZAR: 999, layerType: 'full_body',
    productImageUrl: 'https://images.unsplash.com/photo-1572804013427-4d7ca7268217?auto=format&fit=max&w=400&q=80',
    affiliateCheckoutUrl: 'https://www.zara.com/za/', isHotDeal: false, isNew: true, isTrending: true,
  },

  // ── COTTON ON ─────────────────────────────────────────────────────────────
  {
    id: 'cottonon_tee_01', storeName: 'Cotton On', storeSlug: 'cottonon',
    title: 'Essential Black Tee', priceZAR: 249, layerType: 'inner_body',
    productImageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=max&w=400&q=80',
    affiliateCheckoutUrl: 'https://cottonon.com/za/', isHotDeal: true, isNew: true, isTrending: false,
  },
  {
    id: 'cottonon_hoodie_02', storeName: 'Cotton On', storeSlug: 'cottonon',
    title: 'Relaxed Fleece Hoodie', priceZAR: 449, layerType: 'outer_body',
    productImageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?auto=format&fit=max&w=400&q=80',
    affiliateCheckoutUrl: 'https://cottonon.com/za/', isHotDeal: true, isNew: false, isTrending: true,
  },
  {
    id: 'cottonon_polo_03', storeName: 'Cotton On', storeSlug: 'cottonon',
    title: 'Classic White Polo', priceZAR: 299, layerType: 'inner_body',
    productImageUrl: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=max&w=400&q=80',
    affiliateCheckoutUrl: 'https://cottonon.com/za/', isHotDeal: false, isNew: true, isTrending: false,
  },
  {
    id: 'cottonon_cap_04', storeName: 'Cotton On', storeSlug: 'cottonon',
    title: 'Washed Baseball Cap', priceZAR: 179, layerType: 'accessory',
    productImageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=max&w=400&q=80',
    affiliateCheckoutUrl: 'https://cottonon.com/za/', isHotDeal: true, isNew: false, isTrending: true,
  },

  // ── WOOLWORTHS ────────────────────────────────────────────────────────────
  {
    id: 'woolworths_denim_01', storeName: 'Woolworths', storeSlug: 'woolworths',
    title: 'Classic Stretch Denim', priceZAR: 599, layerType: 'lower_body',
    productImageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=max&w=400&q=80',
    affiliateCheckoutUrl: 'https://woolworths.co.za/', isHotDeal: false, isNew: false, isTrending: true,
  },
  {
    id: 'woolworths_chino_02', storeName: 'Woolworths', storeSlug: 'woolworths',
    title: 'Slim Fit Chino', priceZAR: 499, layerType: 'lower_body',
    productImageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=max&w=400&q=80',
    affiliateCheckoutUrl: 'https://woolworths.co.za/', isHotDeal: true, isNew: false, isTrending: false,
  },
  {
    id: 'woolworths_skirt_03', storeName: 'Woolworths', storeSlug: 'woolworths',
    title: 'Pencil Midi Skirt', priceZAR: 549, layerType: 'lower_body',
    productImageUrl: 'https://images.unsplash.com/photo-1583496661160-fb5974ca5596?auto=format&fit=max&w=400&q=80',
    affiliateCheckoutUrl: 'https://woolworths.co.za/', isHotDeal: false, isNew: true, isTrending: true,
  },
  {
    id: 'woolworths_belt_04', storeName: 'Woolworths', storeSlug: 'woolworths',
    title: 'Leather Belt', priceZAR: 199, layerType: 'accessory',
    productImageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=max&w=400&q=80',
    affiliateCheckoutUrl: 'https://woolworths.co.za/', isHotDeal: true, isNew: true, isTrending: false,
  },

  // ── JET ───────────────────────────────────────────────────────────────────
  {
    id: 'jet_coat_01', storeName: 'Jet', storeSlug: 'jet',
    title: 'Utility Shell Coat', priceZAR: 799, layerType: 'outer_body',
    productImageUrl: 'https://images.unsplash.com/photo-1548624313-0396d6b8cbc4?auto=format&fit=max&w=400&q=80',
    affiliateCheckoutUrl: 'https://jet.co.za/', isHotDeal: false, isNew: true, isTrending: false,
  },
  {
    id: 'jet_denim_jacket_02', storeName: 'Jet', storeSlug: 'jet',
    title: 'Classic Denim Jacket', priceZAR: 599, layerType: 'outer_body',
    productImageUrl: 'https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?auto=format&fit=max&w=400&q=80',
    affiliateCheckoutUrl: 'https://jet.co.za/', isHotDeal: true, isNew: false, isTrending: true,
  },
  {
    id: 'jet_leather_jacket_03', storeName: 'Jet', storeSlug: 'jet',
    title: 'Biker Leather Jacket', priceZAR: 1199, layerType: 'outer_body',
    productImageUrl: 'https://images.unsplash.com/photo-1520975913870-3161b60d710b?auto=format&fit=max&w=400&q=80',
    affiliateCheckoutUrl: 'https://jet.co.za/', isHotDeal: false, isNew: false, isTrending: true,
  },
  {
    id: 'jet_cargo_04', storeName: 'Jet', storeSlug: 'jet',
    title: 'Cargo Jogger Pants', priceZAR: 449, layerType: 'lower_body',
    productImageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=max&w=400&q=80',
    affiliateCheckoutUrl: 'https://jet.co.za/', isHotDeal: true, isNew: true, isTrending: false,
  },

  // ── MR PRICE ──────────────────────────────────────────────────────────────
  {
    id: 'mrprice_hoodie_01', storeName: 'Mr Price', storeSlug: 'mrprice',
    title: 'Oversized Fleece Hoodie', priceZAR: 449, layerType: 'outer_body',
    productImageUrl: 'https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?auto=format&fit=max&w=400&q=80',
    affiliateCheckoutUrl: 'https://mrpricefashion.com/', isHotDeal: true, isNew: false, isTrending: true,
  },
  {
    id: 'mrprice_white_tee_02', storeName: 'Mr Price', storeSlug: 'mrprice',
    title: 'Everyday White Tee', priceZAR: 149, layerType: 'inner_body',
    productImageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=max&w=400&q=80',
    affiliateCheckoutUrl: 'https://mrpricefashion.com/', isHotDeal: true, isNew: true, isTrending: false,
  },
  {
    id: 'mrprice_sneakers_03', storeName: 'Mr Price', storeSlug: 'mrprice',
    title: 'Clean White Sneakers', priceZAR: 399, layerType: 'footwear',
    productImageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=max&w=400&q=80',
    affiliateCheckoutUrl: 'https://mrpricefashion.com/', isHotDeal: false, isNew: true, isTrending: true,
  },
  {
    id: 'mrprice_jogger_04', storeName: 'Mr Price', storeSlug: 'mrprice',
    title: 'Fleece Jogger Pants', priceZAR: 299, layerType: 'lower_body',
    productImageUrl: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=max&w=400&q=80',
    affiliateCheckoutUrl: 'https://mrpricefashion.com/', isHotDeal: true, isNew: false, isTrending: true,
  },
];

export default retailCatalog;
