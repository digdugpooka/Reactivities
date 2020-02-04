using System;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using Application.Errors;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Activities
{
    public class Attend
    {
        public class Command : IRequest
        {
            public Guid Id { get; set; }
        }

        public class Handler : IRequestHandler<Command>
        {
            private readonly DataContext context;
            private readonly IUserAccessor userAccessor;

            public Handler(DataContext context, IUserAccessor userAccessor)
            {
                this.userAccessor = userAccessor;
                this.context = context;
            }

            public async Task<Unit> Handle(Command request, CancellationToken cancellationToken)
            {
                // handler logic
                var activity = await context.Activities.FindAsync(request.Id);
                if (activity == null) throw new RestException(HttpStatusCode.NotFound, new { Activity = "Could not find activity." });

                var user = await context.Users.SingleOrDefaultAsync(u => 
                    u.UserName == userAccessor.GetCurrentUsername());

                // Ensure user isn't already attending.
                var attendance = await context.UserActivities.SingleOrDefaultAsync(
                    x => x.ActivityId == activity.Id && x.AppUserId == user.Id);
                if (attendance != null) throw new RestException(HttpStatusCode.BadRequest, new { Attendance = "Already attending this activity."});

                attendance = new UserActivity 
                {
                    Activity = activity,
                    AppUser = user,
                    IsHost = false,
                    DateJoined = DateTime.Now
                };
                context.UserActivities.Add(attendance);

                var success = await context.SaveChangesAsync() > 0; // SaveChangesAsync returns # of changes persisted to DB.
                if (success) return Unit.Value;

                throw new Exception("Problem saving activity");
            }
        }
    }
}