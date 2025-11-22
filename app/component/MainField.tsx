'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import Category from "@/app/json/category.json"


export default function MainField() {

    return ( 
        <div className="background">
            <div className = 'container m-auto max-w-[1160px] px-[5%] lg:p-0 lg:w-[90%]' >
                <div className="grid grid-cols-1 lg:grid-cols-3 sm:grid-cols-2 gap-8 pb-20 border-b">
                    {
                        Category.categories.map((category, index) => {
                            return (
                                <Link href={'/category/' + category.id} key={category.id}
                                className={`text-[#fff] rounded border-[1px] border-[#2f97a3] px-[30px] py-[20px] text-center hover:text-[#2f97a3] hover:bg-[#fff] bg-[#2f97a3] cursor-pointer ${index === Category.categories.length - 1 ? '' : ''}`}>
                                    <span>
                                        {category.name}
                                    </span>
                                </Link>
                            )
                        })
                    }
                </div> 
            </div>
            {/* <div className="py-8 mx-12"></div> */}
        </div>
    );
}