import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { handleError, validateRequestBody } from '@/lib/utils';

// Create Academic Plan (POST)
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validationError = validateRequestBody(body, ['studentId', 'semesters']);
        if (validationError) {
            return NextResponse.json({ error: validationError }, { status: 400 });
        }

        const { studentId, semesters } = body;

        const createdPlan = await prisma.academicPlan.create({
            data: {
                studentId,
                semesters: {
                    create: semesters.map((semester: any) => ({
                        name: semester.name,
                        courses: {
                            create: semester.courses.map((course: any) => ({
                                code: course.code,
                                title: course.title,
                                credits: course.credits,
                                description: course.description || null,
                                prerequisites: course.prerequisites || []
                            }))
                        }
                    }))
                }
            },
            include: {
                semesters: {
                    include: { courses: true }
                }
            }
        });

        return NextResponse.json(createdPlan);
    } catch (error) {
        return handleError(error, 'Failed to create academic plan');
    }
}

// Get Academic Plan(s) (GET)
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const studentId = searchParams.get('studentId');

    try {
        if (id) {
            const academicPlan = await prisma.academicPlan.findUnique({
                where: { id: Number(id) },
                include: { semesters: { include: { courses: true } } }
            });

            if (!academicPlan) {
                return NextResponse.json({ error: 'Academic Plan not found' }, { status: 404 });
            }

            return NextResponse.json(academicPlan);
        } else if (studentId) {
            const semesters = await prisma.semester.findMany({
                where: { AcademicPlan: { studentId: Number(studentId) } },
                include: { courses: true }
            });

            return NextResponse.json(semesters);
        } else {
            const academicPlans = await prisma.academicPlan.findMany({
                include: { semesters: { include: { courses: true } } }
            });

            return NextResponse.json(academicPlans);
        }
    } catch (error) {
        return handleError(error, 'Failed to fetch academic plan(s)');
    }
}

// Update Academic Plan (PUT)
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const validationError = validateRequestBody(body, ['id', 'studentId', 'semesters']);
        if (validationError) {
            return NextResponse.json({ error: validationError }, { status: 400 });
        }

        const { id, studentId, semesters } = body;

        const updatedPlan = await prisma.academicPlan.update({
            where: { id: Number(id) },
            data: {
                studentId,
                semesters: {
                    deleteMany: {}, // Clear existing semesters
                    create: semesters.map((semester: any) => ({
                        name: semester.name,
                        courses: {
                            create: semester.courses.map((course: any) => ({
                                code: course.code,
                                title: course.title,
                                credits: course.credits,
                                description: course.description || null,
                                prerequisites: course.prerequisites || []
                            }))
                        }
                    }))
                }
            },
            include: { semesters: { include: { courses: true } } }
        });

        return NextResponse.json(updatedPlan);
    } catch (error) {
        return handleError(error, 'Failed to update academic plan');
    }
}

// Delete Academic Plan (DELETE)
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing academic plan ID' }, { status: 400 });
        }

        await prisma.semester.deleteMany({ where: { academicPlanId: Number(id) } });

        await prisma.academicPlan.delete({ where: { id: Number(id) } });

        return NextResponse.json({ message: 'Academic Plan deleted successfully' });
    } catch (error) {
        return handleError(error, 'Failed to delete academic plan');
    }
}