import EnquiryDetailsClient from '@/components/enquiries/EnquiryDetailsClient';
import { generatePageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ leadNumber: string }> }) {
    const { leadNumber } = await params;
    return await generatePageMetadata({
        pagePath: `/my-enquiries/${leadNumber}`,
        defaultTitle: `Enquiry #${leadNumber} | Leats`,
        defaultDescription: `View details for enquiry #${leadNumber}.`,
        defaultKeywords: "enquiry details, track enquiry",
    });
}

export default async function EnquiryDetailsPage({ params }: { params: Promise<{ leadNumber: string }> }) {
    const { leadNumber } = await params;
    return <EnquiryDetailsClient leadNumber={leadNumber} />;
}
