import React, { useState, useEffect } from 'react';
import type { CarListing } from '../types/car'; 

interface AdminPageProps {
    onBack: () => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ onBack }) => {
    const [pendingListings, setPendingListings] = useState<CarListing[]>([]);
    const [approvedCount, setApprovedCount] = useState(0);
    const [rejectedCount, setRejectedCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectingListingId, setRejectingListingId] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isSubmittingReject, setIsSubmittingReject] = useState(false);

    useEffect(() => {
        fetchPendingListings();
    }, []);

    const fetchPendingListings = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/admin/listings/pending');
            if (response.ok) {
                const listings = await response.json();
                setPendingListings(listings);
            }
        } catch (error) {
            console.error('Error fetching pending listings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            const response = await fetch(`http://localhost:5000/api/admin/listings/${id}/verify`, {
                method: 'PUT',
            });
            if (response.ok) {
                setPendingListings(prev => prev.filter(listing => listing.id !== id));
                setApprovedCount(prev => prev + 1);
            }
        } catch (error) {
            console.error('Error approving listing:', error);
        }
    };

    const handleRejectClick = (id: string) => {
        setRejectingListingId(id);
        setRejectionReason('');
        setShowRejectDialog(true);
    };

    const handleRejectConfirm = async () => {
        if (!rejectingListingId) return;

        if (!rejectionReason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }

        setIsSubmittingReject(true);
        try {
            const response = await fetch(`http://localhost:5000/api/admin/listings/${rejectingListingId}/reject`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reason: rejectionReason }),
            });

            if (response.ok) {
                setPendingListings(prev => prev.filter(listing => listing.id !== rejectingListingId));
                setRejectedCount(prev => prev + 1);
                setShowRejectDialog(false);
                setRejectingListingId(null);
                setRejectionReason('');
            }
        } catch (error) {
            console.error('Error rejecting listing:', error);
            alert('Error rejecting listing. Please try again.');
        } finally {
            setIsSubmittingReject(false);
        }
    };
    
    // --- Render Functions ---
    const renderListingCard = (listing: CarListing) => (
        <div key={listing.id} className="bg-gray-700 rounded-xl overflow-hidden shadow-lg flex flex-col md:flex-row border border-gray-600">
            {/* Image */}
            <div className="w-full md:w-1/3 h-48 md:h-auto overflow-hidden">
                <img 
                    src={listing.imageUrls?.[0] || 'https://placehold.co/400x300/1f2937/ffffff?text=Image+Missing'} 
                    alt={`${listing.make} ${listing.model}`} 
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null; 
                        target.src = `https://placehold.co/400x300/1f2937/ffffff?text=Image+Missing`;
                    }}
                />
            </div>
            
            {/* Details and Actions */}
            <div className="w-full md:w-2/3 p-4 flex flex-col justify-between">
                <div>
                    <h3 className="text-2xl font-bold text-white mb-1">
                        {listing.year} {listing.make} {listing.model}
                    </h3>
                    <p className="text-xl font-extrabold text-red-400 mb-2">₹{listing.price?.toLocaleString()}</p>
                    
                    <div className="bg-gray-600 p-3 rounded-lg mb-3 text-sm text-gray-300">
                        <p><strong>Vehicle #:</strong> {(listing as any).vehicleNumber}</p>
                        <p><strong>Owner:</strong> {(listing as any).ownerName}</p>
                        <p><strong>Contact:</strong> {(listing as any).ownerContactNumber}</p>
                        {(listing as any).chassisNumber && <p><strong>Chassis #:</strong> {(listing as any).chassisNumber}</p>}
                    </div>

                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">{listing.description}</p>
                    
                    <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                        <span className="bg-gray-600 px-3 py-1 rounded-full">Mileage: {listing.mileage?.toLocaleString()} KM</span>
                        <span className="bg-gray-600 px-3 py-1 rounded-full">Condition: {(listing as any).condition}</span>
                        <span className="bg-gray-600 px-3 py-1 rounded-full">ID: {listing.id}</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex space-x-3">
                    <button 
                        onClick={() => handleApprove(listing.id)}
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition"
                    >
                        ✓ Approve & Post Live
                    </button>
                    <button 
                        onClick={() => handleRejectClick(listing.id)}
                        className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition"
                    >
                        ✕ Reject
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-900 p-4 md:p-10 pt-20">
            <div className="max-w-7xl mx-auto">
                {/* Header and Back Button */}
                <div className="flex justify-between items-center mb-8 border-b border-red-600/50 pb-4">
                    <h1 className="text-4xl font-extrabold text-white">
                        Admin Dashboard
                    </h1>
                    <button 
                        onClick={onBack} 
                        className="flex items-center text-red-400 hover:text-red-500 transition font-medium text-sm"
                    >
                        ← Back to Home
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-gray-800 p-5 rounded-xl border-l-4 border-yellow-500 shadow-md">
                        <p className="text-gray-400 text-sm">Pending Submissions</p>
                        <p className="text-3xl font-bold text-yellow-400 mt-1">{pendingListings.length}</p>
                    </div>
                    <div className="bg-gray-800 p-5 rounded-xl border-l-4 border-green-500 shadow-md">
                        <p className="text-gray-400 text-sm">Approved (Session)</p>
                        <p className="text-3xl font-bold text-green-400 mt-1">{approvedCount}</p>
                    </div>
                    <div className="bg-gray-800 p-5 rounded-xl border-l-4 border-red-500 shadow-md">
                        <p className="text-gray-400 text-sm">Rejected (Session)</p>
                        <p className="text-3xl font-bold text-red-400 mt-1">{rejectedCount}</p>
                    </div>
                </div>

                {/* Pending Listings Section */}
                <h2 className="text-3xl font-bold text-white mb-6">Pending Car Listings</h2>
                
                {loading ? (
                    <div className="text-center p-12 bg-gray-800 rounded-xl border border-gray-700">
                        <p className="text-xl font-semibold text-gray-400">Loading pending listings...</p>
                    </div>
                ) : pendingListings.length > 0 ? (
                    <div className="space-y-6">
                        {pendingListings.map(renderListingCard)}
                    </div>
                ) : (
                    <div className="text-center p-12 bg-gray-800 rounded-xl border border-gray-700">
                        <p className="text-2xl font-semibold text-green-400">
                            No Pending Listings! 
                        </p>
                        <p className="text-gray-400 mt-2">The queue is clear. Time for a coffee break.</p>
                    </div>
                )}
            </div>

            {/* Rejection Reason Dialog */}
            {showRejectDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-red-600">
                        <h2 className="text-2xl font-bold text-white mb-4">Reject Listing</h2>
                        <p className="text-gray-300 mb-4">Please provide a reason for rejection. The seller will receive this message.</p>
                        
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="E.g., Images not clear, pricing seems too high, registration details incomplete..."
                            rows={5}
                            maxLength={500}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-red-500 focus:border-red-500 transition resize-none mb-4"
                        />
                        
                        <p className="text-xs text-gray-400 mb-4">{rejectionReason.length}/500 characters</p>

                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowRejectDialog(false)}
                                disabled={isSubmittingReject}
                                className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRejectConfirm}
                                disabled={isSubmittingReject || !rejectionReason.trim()}
                                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                            >
                                {isSubmittingReject ? 'Rejecting...' : 'Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPage;
