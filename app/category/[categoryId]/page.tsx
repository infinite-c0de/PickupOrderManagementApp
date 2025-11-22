'use client'

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation'
import Master from '@/app/layout/Master';
import SearchField from './../../component/SearchField';
import Link from 'next/link';


interface ApiResponse {
    articles: []
}
interface Article {
    id: number;
    title: string;
}

export default function Category() {
    const param = useParams()
    const [articles, setArticles] = useState<Article[] | null>(null);
    const [category, setCategory] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const jsonData = require(`@/app/json/${param.categoryId}.json`);
                setArticles(jsonData.articles);
            } catch (error) {
                console.error('Error fetching JSON file:', error);
            }
        };

        const fetchCategory = async () => {
            try {
                const jsonData = require(`@/app/json/category.json`);
                for (let i = 0; i < jsonData.categories.length; i++) {
                    if (jsonData.categories[i].id === Number(param.categoryId)) {
                      setCategory(jsonData.categories[i].name)
                      break; // If found, exit the loop
                    }
                  }
            } catch (error) {
                console.error('Error fetching JSON file:', error);
            }
        };


        if (param) {
            fetchData();
            fetchCategory();
        }
    }, [param]);

    return (
        <>
            <Master>
                <div className='grid gap-5 p-20 min-h-[calc(100vh-214px)] background'>
                    <h3 className='text-[#2f97a3] text-[36px]'>{category} Articles</h3>
                    {
                        articles?.map((article) => {
                            return (
                                <Link key={article.id} href={'/article/' + param.categoryId + '/' + article.id}>
                                    <p style={{ color: 'black' }}>{article.title}</p>
                                </Link>
                            )
                        })
                    }
                </div>
            </Master>
        </>
    );
}
