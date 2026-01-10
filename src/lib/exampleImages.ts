export type ExampleImage = {
    id: string;
    url: string;
    label: string;
    description: string;
};

// Person/model example images from showcase
export const EXAMPLE_PERSON_IMAGES: ExampleImage[] = [
    {
        id: 'showcase-model-1',
        url: '/assets/showcase/1/g1.png',
        label: 'Model 1',
        description: 'Fashion model in outfit'
    },
    {
        id: 'showcase-model-2',
        url: '/assets/showcase/2/g2.png',
        label: 'Model 2',
        description: 'Fashion model in outfit'
    },
    {
        id: 'showcase-model-3',
        url: '/assets/showcase/3/g3.png',
        label: 'Model 3',
        description: 'Fashion model in outfit'
    }
];

// Garment/dress example images from showcase
export const EXAMPLE_GARMENT_IMAGES: ExampleImage[] = [
    {
        id: 'showcase-dress-1a',
        url: '/assets/showcase/1/g1d1.png',
        label: 'Dress 1A',
        description: 'Elegant dress design'
    },
    {
        id: 'showcase-dress-1b',
        url: '/assets/showcase/1/g1d2.png',
        label: 'Dress 1B',
        description: 'Stylish dress design'
    },
    {
        id: 'showcase-dress-2a',
        url: '/assets/showcase/2/g2d1.png',
        label: 'Dress 2A',
        description: 'Modern garment'
    },
    {
        id: 'showcase-dress-3a',
        url: '/assets/showcase/3/g3d1.png',
        label: 'Dress 3A',
        description: 'Contemporary design'
    },
    {
        id: 'showcase-dress-3b',
        url: '/assets/showcase/3/g3d2.png',
        label: 'Dress 3B',
        description: 'Trendy outfit'
    }
];
