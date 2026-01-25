import { useRef } from 'react';
import { motion } from 'framer-motion';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"

const categories = [
    { name: 'Bébé', image: 'https://i.pinimg.com/736x/da/85/27/da852720586700f5548eb4c50b55c8fe.jpg' },
    { name: 'Visage', image: 'https://i.pinimg.com/736x/81/98/dd/8198dd32d94c0c3cc950af3d6643e228.jpg' },
    { name: 'Cheveux', image: 'https://i.pinimg.com/1200x/a1/04/40/a10440858e9ea5f6d2bc43e07f4d9505.jpg' },
    { name: 'Solaire', image: 'https://i.pinimg.com/736x/c3/7a/8a/c37a8a18216b4e8e5ca5b74d7afff26d.jpg' },
];

const CategorySection = () => {
    return (
        <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="category-section py-12"
        >
            <div className="section-container max-w-7xl mx-auto px-4">
                <h2 className="section-title text-3xl font-bold mb-8 text-center">Acheter par catégorie</h2>
                <div className="w-full flex justify-center">
                    <Carousel
                        opts={{
                            align: "start",
                        }}
                        className="w-[87%]"
                    >
                        <CarouselContent className=''>
                            {categories.map((category, index) => (
                                <CarouselItem key={index} className="md:basis-1/3 basis-full pl-4">
                                    <div className="relative h-[300px] w-[95%] justify-self-center overflow-hidden rounded-xl group cursor-pointer shadow-md hover:shadow-xl transition-shadow duration-300">
                                        {/* Background Image */}
                                        <div
                                            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                            style={{ backgroundImage: `url(${category.image})` }}
                                        />
                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />
                                        {/* Content */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <h3 className="text-white text-3xl font-bold uppercase tracking-wider drop-shadow-md">{category.name}</h3>
                                        </div>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                    </Carousel>
                </div>
            </div>
        </motion.section>
    );
};

export default CategorySection;
