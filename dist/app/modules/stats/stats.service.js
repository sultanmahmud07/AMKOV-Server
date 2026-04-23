"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsService = exports.getAdminStats = exports.getGuideStats = exports.getTouristStats = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const mongoose_1 = __importDefault(require("mongoose"));
const booking_model_1 = require("../booking/booking.model");
const review_model_1 = require("../review/review.model");
const tour_model_1 = require("../tour/tour.model");
const payment_model_1 = require("../payment/payment.model");
const product_model_1 = require("../product/product.model");
const contact_model_1 = require("../contact/contact.model");
const category_model_1 = require("../category/category.model");
const user_model_1 = require("../user/user.model"); // ✅ Uncommented
const getTouristStats = (touristId) => __awaiter(void 0, void 0, void 0, function* () {
    // Basic counts
    const totalBookings = yield booking_model_1.Booking.countDocuments({ user: touristId });
    const completedCount = yield booking_model_1.Booking.countDocuments({ user: touristId, status: "COMPLETED" });
    const upcomingCount = yield booking_model_1.Booking.countDocuments({
        user: touristId,
        status: "CONFIRMED",
        date: { $gte: new Date() },
    });
    const cancelledCount = yield booking_model_1.Booking.countDocuments({ user: touristId, status: "CANCELLED" });
    // Total paid amount (joined from payments)
    const paidAgg = yield booking_model_1.Booking.aggregate([
        { $match: { user: new mongoose_1.default.Types.ObjectId(touristId) } },
        {
            $lookup: {
                from: "payments",
                localField: "payment",
                foreignField: "_id",
                as: "paymentData",
            },
        },
        { $unwind: { path: "$paymentData", preserveNullAndEmptyArrays: true } },
        { $match: { "paymentData.status": "PAID" } },
        { $group: { _id: null, totalPaid: { $sum: "$paymentData.amount" } } },
    ]);
    const totalPaid = (paidAgg[0] && paidAgg[0].totalPaid) || 0;
    // Total reviews by tourist
    const totalReviews = yield review_model_1.Review.countDocuments({ user: touristId });
    // Recent bookings (last 5) with populated tour/guide/payment
    const recentBookings = yield booking_model_1.Booking.find({ user: touristId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("tour", "title fee destinationCity")
        .populate("guide", "name email picture")
        .populate("payment", "status amount transactionId createdAt");
    // Gather booking ids to fetch recent payments (if any)
    const bookingIds = recentBookings.map((b) => b._id);
    const recentPayments = bookingIds.length
        ? yield payment_model_1.Payment.find({ booking: { $in: bookingIds } })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate({
            path: "booking",
            select: "tour user guide date time totalPrice",
            populate: [
                { path: "tour", select: "title fee" },
                { path: "guide", select: "name" },
                { path: "user", select: "name email" },
            ],
        })
        : [];
    return {
        data: {
            touristId,
            totalBookings,
            completedCount,
            upcomingCount,
            cancelledCount,
            totalPaid,
            totalReviews,
            recentBookings, // array of Booking documents (populated)
            recentPayments, // array of Payment documents (populated)
        },
    };
});
exports.getTouristStats = getTouristStats;
const getGuideStats = (guideId) => __awaiter(void 0, void 0, void 0, function* () {
    // Tours count
    const totalTours = yield tour_model_1.Tour.countDocuments({ author: guideId });
    // Bookings counts
    const totalBookings = yield booking_model_1.Booking.countDocuments({ guide: guideId });
    const completedBookings = yield booking_model_1.Booking.countDocuments({ guide: guideId, status: "COMPLETED" });
    const upcomingBookings = yield booking_model_1.Booking.countDocuments({
        guide: guideId,
        status: "CONFIRMED",
        date: { $gte: new Date() },
    });
    // Earnings from paid payments (aggregate)
    const earningsAgg = yield booking_model_1.Booking.aggregate([
        { $match: { guide: new mongoose_1.default.Types.ObjectId(guideId) } },
        {
            $lookup: {
                from: "payments",
                localField: "payment",
                foreignField: "_id",
                as: "paymentData",
            },
        },
        { $unwind: { path: "$paymentData", preserveNullAndEmptyArrays: true } },
        { $match: { "paymentData.status": "PAID" } },
        { $group: { _id: null, earnings: { $sum: "$paymentData.amount" } } },
    ]);
    const earnings = (earningsAgg[0] && earningsAgg[0].earnings) || 0;
    // Reviews stats for guide
    const reviewStats = yield review_model_1.Review.aggregate([
        { $match: { guide: new mongoose_1.default.Types.ObjectId(guideId) } },
        {
            $group: {
                _id: null,
                reviewCount: { $sum: 1 },
                avgRating: { $avg: "$rating" },
            },
        },
    ]);
    const reviewCount = reviewStats.length ? reviewStats[0].reviewCount : 0;
    const avgRating = reviewStats.length ? Number(reviewStats[0].avgRating.toFixed(2)) : 0;
    // Recent bookings (last 5) for guide
    const recentBookings = yield booking_model_1.Booking.find({ guide: guideId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("tour", "title fee destinationCity")
        .populate("user", "name email phone")
        .populate("payment", "status amount transactionId createdAt");
    // Recent payments related to guide's recent bookings
    const bookingIds = recentBookings.map((b) => b._id);
    const recentPayments = bookingIds.length
        ? yield payment_model_1.Payment.find({ booking: { $in: bookingIds } })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate({
            path: "booking",
            select: "tour user date time totalPrice",
            populate: [
                { path: "tour", select: "title fee" },
                { path: "user", select: "name email" },
            ],
        })
        : [];
    return {
        data: {
            guideId,
            totalTours,
            totalBookings,
            completedBookings,
            upcomingBookings,
            earnings,
            reviewCount,
            avgRating,
            recentBookings,
            recentPayments,
        },
    };
});
exports.getGuideStats = getGuideStats;
const getAdminStats = () => __awaiter(void 0, void 0, void 0, function* () {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    // 1. Basic Counts
    const totalProductsP = product_model_1.Product.countDocuments();
    const totalCategoriesP = category_model_1.Category.countDocuments();
    const totalInquiriesP = contact_model_1.Contact.countDocuments();
    const totalUsersP = user_model_1.User.countDocuments(); // ✅ Added
    // 2. Inquiry Breakdown
    const productInquiriesP = contact_model_1.Contact.countDocuments({ inquiryType: "PRODUCT" });
    const generalInquiriesP = contact_model_1.Contact.countDocuments({ inquiryType: "GENERAL" });
    // 3. New Additions (Growth metrics)
    const newProductsLast30P = product_model_1.Product.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const newInquiriesLast7P = contact_model_1.Contact.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const newInquiriesLast30P = contact_model_1.Contact.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    // ✅ User Growth Metrics
    const newUsersLast7P = user_model_1.User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const newUsersLast30P = user_model_1.User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    // 4. Low Stock Alert
    const lowStockProductsP = product_model_1.Product.find({ "variations.stock": { $lt: 10 } })
        .select("name slug variations images")
        .limit(5)
        .lean();
    // 5. Recent Activity (Last 5)
    const recentInquiriesP = contact_model_1.Contact.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("products", "name basePrice")
        .lean();
    const recentProductsP = product_model_1.Product.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("category", "name")
        .lean();
    // ✅ Recent Users
    const recentUsersP = user_model_1.User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email role createdAt") // Select safe fields only
        .lean();
    // 6. Inquiry Time-Series
    const inquiryTimeSeriesP = contact_model_1.Contact.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
            $group: {
                _id: {
                    year: { $year: "$createdAt" },
                    month: { $month: "$createdAt" },
                    day: { $dayOfMonth: "$createdAt" },
                },
                total: { $sum: 1 },
            },
        },
        {
            $project: {
                _id: 0,
                date: {
                    $dateFromParts: {
                        year: "$_id.year",
                        month: "$_id.month",
                        day: "$_id.day",
                    },
                },
                total: 1,
            },
        },
        { $sort: { date: 1 } },
    ]);
    // 7. Top Products by Inquiry Count
    const topProductsByInquiriesP = contact_model_1.Contact.aggregate([
        { $match: { inquiryType: "PRODUCT" } },
        { $unwind: "$products" },
        {
            $group: {
                _id: "$products",
                inquiryCount: { $sum: 1 },
            },
        },
        { $sort: { inquiryCount: -1 } },
        { $limit: 6 },
        {
            $lookup: {
                from: "products",
                localField: "_id",
                foreignField: "_id",
                as: "product",
            },
        },
        { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
        {
            $project: {
                productId: "$_id",
                inquiryCount: 1,
                product: {
                    name: "$product.name",
                    basePrice: "$product.basePrice",
                    slug: "$product.slug",
                    image: { $arrayElemAt: ["$product.images", 0] }
                },
            },
        },
    ]);
    // Run all promises in parallel
    const [totalProducts, totalCategories, totalInquiries, totalUsers, // ✅
    productInquiries, generalInquiries, newProductsLast30, newInquiriesLast7, newInquiriesLast30, newUsersLast7, // ✅
    newUsersLast30, // ✅
    lowStockProducts, recentInquiries, recentProducts, recentUsers, // ✅
    inquiryTimeSeries, topProductsByInquiries,] = yield Promise.all([
        totalProductsP,
        totalCategoriesP,
        totalInquiriesP,
        totalUsersP, // ✅
        productInquiriesP,
        generalInquiriesP,
        newProductsLast30P,
        newInquiriesLast7P,
        newInquiriesLast30P,
        newUsersLast7P, // ✅
        newUsersLast30P, // ✅
        lowStockProductsP,
        recentInquiriesP,
        recentProductsP,
        recentUsersP, // ✅
        inquiryTimeSeriesP,
        topProductsByInquiriesP,
    ]);
    // Prepare Inquiry time-series for charting
    const days = [];
    const start = new Date(thirtyDaysAgo);
    for (let d = new Date(start); d <= now; d.setDate(d.getDate() + 1)) {
        days.push({
            date: new Date(d).toISOString().slice(0, 10),
            total: 0,
        });
    }
    // Map results
    const inquiryMap = new Map();
    (inquiryTimeSeries || []).forEach((r) => {
        const key = new Date(r.date).toISOString().slice(0, 10);
        inquiryMap.set(key, r.total || 0);
    });
    const inquirySeries = days.map((day) => ({
        date: day.date,
        total: inquiryMap.get(day.date) || 0
    }));
    return {
        data: {
            summary: {
                totalProducts,
                totalCategories,
                totalInquiries,
                totalUsers, // ✅ Added to summary
            },
            counts: {
                inquiries: {
                    product: productInquiries,
                    general: generalInquiries,
                },
                newProductsLast30,
                newInquiriesLast7,
                newInquiriesLast30,
                newUsersLast7, // ✅ Added to counts
                newUsersLast30, // ✅ Added to counts
            },
            alerts: {
                lowStockProducts,
            },
            recent: {
                inquiries: recentInquiries,
                products: recentProducts,
                users: recentUsers, // ✅ Added to recent activity
            },
            inquirySeries,
            topProductsByInquiries,
        },
    };
});
exports.getAdminStats = getAdminStats;
exports.StatsService = {
    getTouristStats: exports.getTouristStats,
    getAdminStats: exports.getAdminStats,
    getGuideStats: exports.getGuideStats
};
