#include <iostream>
#include <vector>

typedef struct equation {
    long double A, B, C, D;
} Equation;
typedef struct point {
    long double x, y, z;
    // default + parameterized constructor
    struct point(long double x = 0, long double y = 0, long double z = 0)
        : x(x), y(y), z(z)
    {
    }

    // assignment operator modifies object, therefore non-const
    struct point& operator=(const struct point& point)
    {
        x = point.x;
        y = point.y;
        z = point.z;
        return *this;
    }

    // addop. doesn't modify object. therefore const.
    struct point operator+(const struct point& point) const
    {
        return struct point(point.x + x, point.y + y, point.z + z);
    }

    // equality comparison. doesn't modify object. therefore const.
    bool operator==(const struct point& point) const
    {
        return (point.x == x && point.y == y && point.z == z);
    }
} Point;
typedef std::vector<Point> Data;

int Sign(long double x) {
    return (x > 0) ? 1 : ((x < 0) ? -1 : 0);
}

Point intersectionCalc(Equation equation, Point pointA, Point pointB) {
    long double t = (equation.A * pointA.x + equation.B * pointA.y + equation.C * pointA.z + equation.D) / (equation.A * (pointA.x - pointB.x) + equation.B * (pointA.y - pointB.y) + equation.C * (pointA.z - pointB.z));
    return Point(pointA.x + (pointB.x - pointA.x) * t, pointA.y + (pointB.y - pointA.y) * t, pointA.z + (pointB.z - pointA.z) * t);
}

int IsInterception(Equation equation, Point point, Point prevpoint, int prevsign) {
    
    int sign = Sign(equation.A * point.x + equation.B * point.y + equation.C * point.z + equation.D);
    
    if (point == prevpoint) return -1;

    if (sign == 0) return 0;
    else if (sign == prevsign) return 1;
    else return -1;
}

int main()
{
    // plane params
    Equation equation;
    std::cin >> equation.A >> equation.B >> equation.C >> equation.D;
    // data input
    int N;
    std::cin >> N;

    // rigit 3 input dims
    //Data data(N, Point());;
    Data intersections;

    int prevsign = 0;
    int sign;
    Point prevpoint;
    Point point;
    Point intersectionPoint;
    
    for (int i = 0; i < N; i++) {
        //std::cin >> data[i].x >> data[i].y >> data[i].z;        
        std::cin >> point.x >> point.y >> point.z;
        if (i == 0) prevpoint = point;
        sign = IsInterception(equation, point, prevpoint, prevsign);
        if (sign == 0) {
            intersectionPoint = point;
            intersections.push_back(intersectionPoint);
        }
        else if (sign == 1) {
            intersectionPoint = intersectionCalc(equation, prevpoint, point);
            intersections.push_back(intersectionPoint);
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
}