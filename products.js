export default {
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Product Name',
      type: 'string',
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
    },
    {
      name: 'image',
      title: 'Product Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'price',
      title: 'Regular Price / السعر الأصلي',
      type: 'number',
    },
    {
      name: 'salePrice',
      title: 'Sale Price (e.g. 900) / سعر التخفيض',
      type: 'number',
    },
    {
      name: 'category',
      title: 'Category / القسم',
      type: 'string',
      options: {
        list: [
          { title: 'بدل بروفشنال', value: 'professional' },
          { title: 'بدل رقص شرقي', value: 'bellydance' },
          { title: 'جلاليب رقص شرقي', value: 'galabeya' },
          { title: 'بدل قصيرة', value: 'short-suits' }, // <-- ADDED HERE
          { title: 'تخفيضات وعروض (Sales)', value: 'sale' },
        ],
        layout: 'dropdown',
      },
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
    },
  ],
}