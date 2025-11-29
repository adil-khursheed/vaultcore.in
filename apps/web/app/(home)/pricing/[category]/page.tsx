import React from 'react'
import Pricing from './_components/pricing'
import CategoryTab from './_components/category-tab'

const Page = async ({params}:{params:Promise<{category:string}>}) => {
  const { category } = await params;

  return (
    <div className="relative min-h-screen max-w-6xl w-full mx-auto bg-background text-foreground">
      <div className="absolute top-0 left-0 h-full bg-linear-to-b from-transparent via-20% to-border z-10 w-px"/>
      <div className="absolute top-0 right-0 h-full bg-linear-to-b from-transparent via-20% to-border z-10 w-px" />
      
      <section className="flex flex-col items-center justify-center gap-8 py-12">
        <h1 className="mb-0 text-balance font-medium text-5xl tracking-tighter!">
          Pricing that scales with your needs
        </h1>
        
        <CategoryTab category={category}/>
        
        <Pricing/>
      </section>
    </div>
  )
}

export default Page