import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link'; // Import Link

export default function Home() {
  const templates = [
    {
      id: 'modern',
      title: 'Modern Minimalist',
      description: 'Clean and professional, perfect for tech roles.',
      imageSrc: 'https://picsum.photos/400/200?grayscale',
      imageAlt: 'Modern Resume Template Preview',
      imageHint: 'resume template modern',
      features: [
        { label: 'Skills', value: 'React, Node.js, TypeScript' },
        { label: 'Experience', value: 'Software Engineer at TechCorp' },
      ],
    },
    {
      id: 'creative',
      title: 'Creative Professional',
      description: 'Stylish design suitable for creative industries.',
      imageSrc: 'https://picsum.photos/400/200?blur=1',
      imageAlt: 'Creative Resume Template Preview',
      imageHint: 'resume template creative',
      features: [
        { label: 'Portfolio', value: 'www.creativefolio.com' },
        { label: 'Tools', value: 'Adobe Creative Suite, Figma' },
      ],
    },
    {
      id: 'classic',
      title: 'Classic Standard',
      description: 'Traditional layout, universally accepted.',
      imageSrc: 'https://picsum.photos/seed/picsum/400/200',
      imageAlt: 'Classic Resume Template Preview',
      imageHint: 'resume template classic',
      features: [
        { label: 'Education', value: 'MBA, Business University' },
        { label: 'Summary', value: 'Experienced manager...' },
      ],
    },
  ];

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-primary mb-2">Choose Your Resume Style</h1>
        <p className="text-lg text-muted-foreground">Select a template to start building your professional resume.</p>
         <p className="text-center text-muted-foreground text-xs mt-2">
           Note: Templates are visual examples. The generated resume uses a standardized modern Markdown format.
         </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {templates.map((template) => (
          <Link key={template.id} href={`/create?template=${template.id}`} passHref legacyBehavior>
            <a className="block group"> {/* Use <a> tag for legacyBehavior */}
              <Card className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 h-full flex flex-col group-hover:ring-2 group-hover:ring-accent group-hover:ring-offset-2">
                <CardHeader className="p-0 relative">
                  <Image
                    src={template.imageSrc}
                    alt={template.imageAlt}
                    width={400}
                    height={200}
                    className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={template.imageHint}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <CardTitle className="text-xl absolute bottom-3 left-4 text-white">{template.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 flex-grow flex flex-col justify-between">
                   <div>
                    <CardDescription className="text-sm text-muted-foreground mb-4">
                      {template.description}
                    </CardDescription>
                    <div className="space-y-2">
                      {template.features.map((feature, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{feature.label}:</span>
                          <span className="font-medium">{feature.value}</span>
                        </div>
                      ))}
                    </div>
                   </div>
                   <div className="text-center mt-4">
                     <span className="inline-block bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        Start Building
                     </span>
                   </div>
                </CardContent>
              </Card>
            </a>
          </Link>
        ))}
      </div>
    </main>
  );
}
