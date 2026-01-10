export type ExampleImage = {
    id: string;
    url: string;
    label: string;
    description: string;
};

export const EXAMPLE_PERSON_IMAGES: ExampleImage[] = [
    {
        id: 'example-model-1',
        url: '/examples/person/model1.png',
        label: 'Model 1',
        description: 'Professional female model, black outfit'
    },
    {
        id: 'example-model-2',
        url: '/examples/person/model2.png',
        label: 'Model 2',
        description: 'Professional male model, white t-shirt'
    },
    {
        id: 'example-model-3',
        url: '/examples/person/model3.png',
        label: 'Model 3',
        description: 'Edgy female model, oversized blazer'
    }
];
