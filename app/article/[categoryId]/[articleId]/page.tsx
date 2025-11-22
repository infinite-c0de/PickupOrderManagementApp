'use client'

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation'
import Master from '@/app/layout/Master';

interface Article {
    id: number;
    title: string;
    body: string;
}


export default function Article() {
    const params = useParams()

    const [article, setArticle] = useState<Article | null>(null); // Adjust the type of the state

    useEffect(() => {
        const fetchData = async () => {
            try {
                const jsonData = require(`@/app/json/${params.categoryId}.json`) as { articles: Article[] };

                const selectedArticle = jsonData.articles.find((article) => article.id == Number(params.articleId));
                console.log(selectedArticle)

                setArticle(selectedArticle || null); // Update the state based on the found article
            } catch (error) {
                console.error('Error fetching JSON file:', error);
            }
        };

        if (params) {
            fetchData();
        }
    }, [params]);

    return (
        <Master>
            <div className='flex justify-center min-h-[calc(100vh-214px)] background py-3'>
                <div className='w-4/5'>
                <h3 className='text-[#2f97a3] text-[36px]'>{article?.title}</h3>
                    {article && (
                        <div className='body' dangerouslySetInnerHTML={{ __html: article.body }} />
                    )}
                </div>
            </div>
        </Master>
    );
}