#include <iostream>
#include <vector>
#include <cmath>

typedef struct equation {
    long double A, B, C, D;
} Equation;
typedef struct point2 {
    long double x, y;
    // default + parameterized constructor
    point2(long double x = 0, long double y = 0)
        : x(x), y(y)
    {
    }
} Point2;
typedef struct point3 {
    long double x, y, z;
    // default + parameterized constructor
    point3(long double x = 0, long double y = 0, long double z = 0)
        : x(x), y(y), z(z)
    {
    }

    // assignment operator modifies object, therefore non-const
    point3& operator=(const point3& a)
    {
        x = a.x;
        y = a.y;
        z = a.z;
        return *this;
    }

    // addop. doesn't modify object. therefore const.
    struct point3 operator+(const point3& point) const
    {
        return struct point3(point.x + x, point.y + y, point.z + z);
    }

    // equality comparison. doesn't modify object. therefore const.
    bool operator==(const struct point3& point) const
    {
        return (point.x == x && point.y == y && point.z == z);
    }

    /*
    // dot product. doesn't modify object. therefore const.
    long double dot(const point& point) const
    {
        return point.x * x, point.y * y, point.z * z;
    }
    // dot product. doesn't modify object. therefore const.
    long double dot(const point& pointA, const point& pointB) const
    {
        return pointA.dot(pointB);
    }

    // cross product. doesn't modify object. therefore const.
    point cross(const point& point) const
    {
        return struct point(y * point.z - point.y * z,
                            point.x * z - x * point.z,
                            x * point.y - point.x * y);
    }
    // cross product. doesn't modify object. therefore const.
    point cross(const point& pointA, const point& pointB) const
    {
        return pointA.cross(pointB);
    }

    // norm/length. doesn't modify object. therefore const.
    long double norm() const
    {
        return std::sqrt(x * x + y * y + z * z);
    }

    // normalize. doesn't modify object. therefore const.
    point normalize() const
    {
        long double norm = this->norm();
        return struct point(x / norm,
                            y / norm,
                            z / norm);
    }
    */

    /*
    // dot product. doesn't modify object. therefore const.
    long double operator*(const point& point) const
    {
        return point.x * x, point.y * y, point.z * z;
    }

    // cross product. doesn't modify object. therefore const.
    point operator^(const point& point) const
    {
        return struct point(point.x + x, point.y + y, point.z + z);
    }
    */
} Point3;
typedef struct vector3 {
    long double x, y, z;
    // default + parameterized constructor
    vector3(long double x = 0, long double y = 0, long double z = 0)
        : x(x), y(y), z(z)
    {
    }

    // assignment operator modifies object, therefore non-const
    vector3& operator=(const vector3& vector)
    {
        x = vector.x;
        y = vector.y;
        z = vector.z;
        return *this;
    }

    // addop. doesn't modify object. therefore const.
    vector3 operator+(const vector3& vector) const
    {
        return struct vector3(vector.x + x, vector.y + y, vector.z + z);
    }

    // minusop. doesn't modify object. therefore const.
    vector3 operator-(const vector3& vector) const
    {
        return struct vector3(vector.x - x, vector.y - y, vector.z - z);
    }

    // product on a scalar. doesn't modify object. therefore const.
    vector3 operator*(long double scalar) const
    {
        return vector3(scalar * x, scalar * y, scalar * z);
    }

    // equality comparison. doesn't modify object. therefore const.
    bool operator==(const vector3& vector) const
    {
        return (vector.x == x && vector.y == y && vector.z == z);
    }

    // dot product. doesn't modify object. therefore const.
    long double dot(const vector3& vector) const
    {
        return vector.x * x + vector.y * y + vector.z * z;
    }
    // dot product. doesn't modify object. therefore const.
    long double static dot(const vector3& vectorA, const vector3& vectorB)
    {
        return vectorA.dot(vectorB);
    }
    // point dot product. doesn't modify object. therefore const.
    long double dot(const Point3& point) const
    {
        return point.x * x + point.y * y + point.z * z;
    }
    // point dot product. doesn't modify object. therefore const.
    long double static dot(const vector3& vector, const Point3& point)
    {
        return vector.dot(point);
    }

    // cross product. doesn't modify object. therefore const.
    vector3 cross(const vector3& vector) const
    {
        return struct vector3(y * vector.z - vector.y * z,
                      vector.x * z - x * vector.z,
                      x * vector.y - vector.x * y);
    }
    // cross product. doesn't modify object. therefore const.
    vector3 static cross(const vector3& vectorA, const vector3& vectorB)
    {
        return vectorA.cross(vectorB);
    }

    // norm/length. doesn't modify object. therefore const.
    long double norm() const
    {
        return std::sqrt(x * x + y * y + z * z);
    }

    // normalize. doesn't modify object. therefore const.
    vector3 normalize() const
    {
        long double norm = this->norm();
        return vector3(x / norm, y / norm, z / norm);
    }

    /*
    // dot product. doesn't modify object. therefore const.
    long double operator*(const point& point) const
    {
        return point.x * x, point.y * y, point.z * z;
    }

    // cross product. doesn't modify object. therefore const.
    point operator^(const point& point) const
    {
        return struct point(point.x + x, point.y + y, point.z + z);
    }
    */
} Vector3;
typedef std::vector<Vector3> Basis;
typedef std::vector<Point2> Data2D;
typedef std::vector<Point3> Data;

Point2 applyBasis(Basis basis, Point3 point) {
    return Point2(Vector3::dot(basis[0], point), Vector3::dot(basis[1], point));
}

Basis transformBasis(Vector3 vector) {
    Basis basis = { Vector3(1, 0, 0), Vector3(0, 1, 0), Vector3(0, 0, 1) };
    if (vector == basis[0] || vector == basis[1] || vector == basis[2])
        return basis;
    else {
        Vector3 z = vector.normalize();
        Vector3 x = (basis[1] - z * Vector3::dot(basis[1], z)).normalize();
        Vector3 y = Vector3::cross(x, z);
        return Basis({ x, y, z });
    }
}

int Sign(long double x) {
    return (x > 0) ? 1 : ((x < 0) ? -1 : 0);
}

/*
int IsOnInterval(Point3 pointA, Point3 pointB, Point3 point) {
    return (point.x-pointB.x)/(pointA.x - pointB.x) == (point.y - pointB.y) / (pointA.y - pointB.y);
}
*/

Point3 intersectionCalc(Equation equation, Point3 pointA, Point3 pointB) {
    long double t = (equation.A * pointA.x + equation.B * pointA.y + equation.C * pointA.z + equation.D) / (equation.A * (pointA.x - pointB.x) + equation.B * (pointA.y - pointB.y) + equation.C * (pointA.z - pointB.z));
    return Point3(pointA.x + (pointB.x - pointA.x) * t, pointA.y + (pointB.y - pointA.y) * t, pointA.z + (pointB.z - pointA.z) * t);
}

int SideSign(Equation equation, Point3 point) {
    return Sign(equation.A * point.x + equation.B * point.y + equation.C * point.z + equation.D);
    /*
    if (point == prevpoint) return prevsign;

    int sign = Sign(equation.A * point.x + equation.B * point.y + equation.C * point.z + equation.D);

    
    if (sign == 0) return 0;
    if (sign != prevsign) return 1;
    return -1;
    */
}

int main()
{
    // plane params
    Equation equation;
    std::cin >> equation.A >> equation.B >> equation.C >> equation.D;
    // new base calc
    Basis basis = transformBasis(Vector3(equation.A, equation.B, equation.C));

    // data input
    int N;
    std::cin >> N;

    // rigit 3 input dims
    //Data data(N, Point3());;
    Data intersections;
    Data2D intersections2D;

    int prevsign;
    int sign;
    Point3 prevpoint;
    Point3 point;
    Point3 intersectionPoint;
    
    std::cin >> point.x >> point.y >> point.z;
    prevsign = SideSign(equation, point);
    for (int i = 1; i < N; i++) {
        //std::cin >> data[i].x >> data[i].y >> data[i].z;        
        std::cin >> point.x >> point.y >> point.z;
        sign = SideSign(equation, point);
        if (sign == 0) {
            intersectionPoint = point;
            intersections.push_back(intersectionPoint);
            intersections2D.push_back(applyBasis(basis, intersectionPoint));
        }
        else if (sign != prevsign) {
            intersectionPoint = point;
            //intersections.push_back(intersectionPoint);
            ///*
            intersectionPoint = intersectionCalc(equation, prevpoint, point);
            //if (IsOnInterval(prevpoint, point, intersectionPoint))
            intersections.push_back(intersectionPoint);
            intersections2D.push_back(applyBasis(basis, intersectionPoint));
            //*/
        }
        prevpoint = point;
        prevsign = sign;
    }
    
    //output
    std::cout << intersections.size() << std::endl;
    for (int i = 0; i < intersections.size(); i++) {
        point = intersections[i];
        std::cout << point.x << ' ' << point.y << ' ' << point.z << std::endl;
    }
    Point2 point2;
    for (int i = 0; i < intersections.size(); i++) {
        point2 = intersections2D[i];
        std::cout << point2.x << ' ' << point2.y << std::endl;
    }
}