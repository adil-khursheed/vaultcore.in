import React from 'react'
import Pricing from './_components/pricing'
import CategoryTab from './_components/category-tab'
import SectionContainer from '../../_components/section-container';

const Page = async ({params}:{params:Promise<{category:string}>}) => {
  const { category } = await params;

  return (
    <SectionContainer className="relative max-w-6xl mx-auto w-full text-foreground">
      <div className="absolute top-0 left-0 h-full bg-linear-to-b from-transparent via-20% to-border z-10 w-px"/>
      <div className="absolute top-0 right-0 h-full bg-linear-to-b from-transparent via-20% to-border z-10 w-px" />
      
      <section className="flex flex-col items-center justify-center gap-8 py-12">
        <h1 className="mb-0 text-balance font-medium text-2xl md:text-5xl text-center">
          Our Pricing
        </h1>

        <p className="text-muted-foreground text-base md:text-lg text-center max-w-xl w-full mx-auto">
          Save, sort and share passwords with family or work colleagues on different accounts using a single online identity.
        </p>
        
        <CategoryTab category={category}/>
        
        <Pricing/>
      </section>
    </SectionContainer>
  )
}

export default Page