import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { handleError, validateRequestBody } from '@/lib/utils';

// Add a New Semester to an Existing Plan (POST)
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validationError = validateRequestBody(body, ['academicPlanId', 'name', 'courses']);
        if (validationError) {
            return NextResponse.json({ error: validationError }, { status: 400 });
        }

        const { academicPlanId, name, courses } = body;

        const newSemester = await prisma.semester.create({
            data: {
                name,
                academicPlanId,
                courses: {
                    create: courses.map((course: any) => ({
                        code: course.code,
                        title: course.title,
                        credits: course.credits,
                        description: course.description || null,
                        prerequisites: course.prerequisites || []
                    }))
                }
            },
            include: { courses: true }
        });

        return NextResponse.json(newSemester);
    } catch (error) {
        return handleError(error, 'Failed to add semester');
    }
}

// Modify a Semester (PUT)
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const validationError = validateRequestBody(body, ['id', 'name', 'courses']);
        if (validationError) {
            return NextResponse.json({ error: validationError }, { status: 400 });
        }

        const { id, name, courses } = body;

        const updatedSemester = await prisma.semester.update({
            where: { id: Number(id) },
            data: {
                name,
                courses: {
                    deleteMany: {}, // Clear existing courses
                    create: courses.map((course: any) => ({
                        code: course.code,
                        title: course.title,
                        credits: course.credits,
                        description: course.description || null,
                        prerequisites: course.prerequisites || []
                    }))
                }
            },
            include: { courses: true }
        });

        return NextResponse.json(updatedSemester);
    } catch (error) {
        return handleError(error, 'Failed to modify semester');
    }
}

// Delete a Specific Semester (DELETE)
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing semester ID' }, { status: 400 });
        }

        await prisma.course.deleteMany({ where: { semesterId: Number(id) } });

        await prisma.semester.delete({ where: { id: Number(id) } });

        return NextResponse.json({ message: 'Semester deleted successfully' });
    } catch (error) {
        return handleError(error, 'Failed to delete semester');
    }
}