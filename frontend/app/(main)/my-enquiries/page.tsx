import MyEnquiriesClient from '@/components/enquiries/MyEnquiriesClient';
import { generatePageMetadata } from '@/lib/seo';

export async function generateMetadata() {
    return await generatePageMetadata({
        pagePath: "/my-enquiries",
        defaultTitle: "My Enquiries | Leats",
        defaultDescription: "View and track your submitted enquiries.",
        defaultKeywords: "my enquiries, enquiry history, track enquiry",
    });
}

export default function MyEnquiriesPage() {
    return <MyEnquiriesClient />;
}
